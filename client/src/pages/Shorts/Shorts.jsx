import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import Skeleton from "react-loading-skeleton";

import { api } from "../../api/axios";
import AdOverlay from "../../components/AdOverlay/AdOverlay";
import { useAdCampaigns } from "../../hooks/useAdCampaigns";
import { useWatchPresence } from "../../hooks/useWatchPresence";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";

  const totalSeconds = Math.floor(seconds);
  const m = Math.floor(totalSeconds / 60);
  const s = (totalSeconds % 60).toString().padStart(2, "0");

  return `${m}:${s}`;
};

const ShortItem = ({ video, base }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const adOverlayRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isNearViewport, setIsNearViewport] = useState(false);

  // Only fetch ad campaigns once this short has actually scrolled into
  // view — avoids firing 30 requests at once for the whole feed on mount.
  const { campaigns } = useAdCampaigns(isNearViewport ? { video: video.id } : {});
  // Memoized so this array's identity only changes when the underlying
  // campaigns actually change — AdOverlay's scheduling effect depends on
  // it, and ShortItem re-renders very often (onTimeUpdate); a fresh array
  // on every render would keep resetting the "first ad" timer forever.
  const videoOnlyCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.type === "video"),
    [campaigns],
  );

  // Only counted as "watching" while this reel is actually the one playing
  // — clears automatically once scrolled past or paused.
  useWatchPresence("video", playing ? video.id : null, video.title);

  useEffect(() => {
    const el = containerRef.current;
    const videoEl = videoRef.current;
    if (!el || !videoEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {});
          adOverlayRef.current?.resume();
          setIsNearViewport(true);
        } else {
          videoEl.pause();
          adOverlayRef.current?.pause();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused || videoEl.ended) {
      videoEl.play();
    } else {
      videoEl.pause();
    }
  };

  const toggleMute = (event) => {
    event.stopPropagation();
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    setMuted(videoEl.muted);
  };

  const skip = (event, delta) => {
    event.stopPropagation();
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.currentTime = Math.min(
      Math.max(videoEl.currentTime + delta, 0),
      videoEl.duration || 0,
    );
  };

  const handleSeek = (event) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.currentTime = Number(event.target.value);
    setCurrent(Number(event.target.value));
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full snap-start snap-always overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={video.video?.url}
        poster={`${base}${video.thumbnail?.portrait}`}
        className="h-full w-full cursor-pointer object-contain"
        muted
        loop
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          setHasStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />

      <AdOverlay
        ref={adOverlayRef}
        videoRef={videoRef}
        mode="pause"
        campaigns={videoOnlyCampaigns}
        playbackStarted={hasStarted}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Play className="ml-1 h-8 w-8 text-white" fill="white" />
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <button
        type="button"
        onClick={(event) => skip(event, -10)}
        aria-label="Rewind 10 seconds"
        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
      >
        <RotateCcw className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={(event) => skip(event, 10)}
        aria-label="Forward 10 seconds"
        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
      >
        <RotateCw className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-4 pt-16">
        <Link
          to={`/watch/${video.id}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-block text-base font-bold text-white hover:text-[#16d6dc]"
        >
          {video.title}
        </Link>
        <p className="mt-1 truncate text-sm text-slate-300">
          {video.channelName}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] font-medium tabular-nums text-white/85">
            {formatTime(current)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onClick={(event) => event.stopPropagation()}
            onChange={handleSeek}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-[#16d6dc]"
          />
          <span className="text-[11px] font-medium tabular-nums text-white/85">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

const Shorts = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/site/videos", { params: { sort: "random", limit: 30 } })
      .then(({ data }) => {
        if (!cancelled) setVideos(data?.data?.videos || []);
      })
      .catch(() => {
        if (!cancelled) setVideos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const base = api.defaults.baseURL;

  return (
    <div className="h-[calc(100dvh-72px)] w-full bg-black text-white md:h-dvh">
      {loading ? (
        <div className="mx-auto h-full w-full max-w-[520px] space-y-3 overflow-hidden bg-[#111618] pb-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-full w-full overflow-hidden">
              <Skeleton height="100%" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-slate-400">
          No shorts available right now.
        </div>
      ) : (
        <div className="shorts-feed-scroll mx-auto h-full w-full max-w-[520px] snap-y snap-mandatory overflow-y-auto">
          {videos.map((video) => (
            <ShortItem key={video.id} video={video} base={base} />
          ))}
        </div>
      )}

      {/* Hide the scroll container's scrollbar — snap-scrolling reels don't
          need a visible track, and it clutters the mobile full-screen view. */}
      <style>
        {`
          .shorts-feed-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .shorts-feed-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default Shorts;
