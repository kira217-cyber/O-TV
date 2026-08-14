import React, { useEffect, useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

import { api } from "../../api/axios";
import AdOverlay from "../AdOverlay/AdOverlay";
import { useAdCampaigns } from "../../hooks/useAdCampaigns";
import { useWatchPresence } from "../../hooks/useWatchPresence";
import { trackAction } from "../../hooks/presenceSocket";

// How often to re-check what should be playing — catches a scheduled
// transition (one program ending, the next starting) even if the current
// video happens to keep playing past its slot (e.g. it's longer than the
// duration the admin recorded). Schedule times are minute-granular, so a
// few seconds of poll latency is imperceptible against that.
const RESYNC_INTERVAL_MS = 5000;

// Plays a "scheduled" Live TV channel — a real, seekable video file, but
// presented like a live broadcast: on load it seeks to wherever the
// programming schedule says "now" is, there's no seek bar (you can't
// rewind past live), and it periodically re-checks the schedule to swap
// to the next program automatically, exactly like HlsPlayer does for a
// real external stream.
const ScheduledLiveTvPlayer = ({ channelId, initialNowPlaying, poster, title, adsTarget }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const resyncTimer = useRef(null);

  const [nowPlaying, setNowPlaying] = useState(initialNowPlaying || null);
  const [hasStarted, setHasStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(false);

  const { campaigns } = useAdCampaigns(adsTarget);
  useWatchPresence("liveTv", adsTarget?.liveTv, title);

  const fetchNowPlaying = async () => {
    try {
      const { data } = await api.get(`/api/site/live-tv/${channelId}/now-playing`);
      return data?.data?.nowPlaying || null;
    } catch {
      return null;
    }
  };

  // Load whatever nowPlaying currently points to, seek to its offset, and
  // autoplay — falls back to muted playback if the browser blocks
  // autoplay-with-sound, matching every other player in this app.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !nowPlaying?.video?.url) {
      setError(!nowPlaying);
      return undefined;
    }

    setError(false);
    setBuffering(true);

    const onLoadedMetadata = () => {
      video.currentTime = nowPlaying.offsetSeconds || 0;
    };

    const tryPlay = async () => {
      try {
        await video.play();
      } catch {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      }
    };

    video.src = nowPlaying.video.url;
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", tryPlay, { once: true });
    video.addEventListener("error", () => setError(true));

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", tryPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying?.video?.url]);

  // Fetches now-playing for this channel and periodically re-checks it so
  // a program transition happens automatically without the viewer needing
  // to refresh — keyed on channelId (not on nowPlaying itself) so it
  // doesn't restart every time a resync swaps the video. Also covers the
  // case where the caller didn't hand us fresh data up front (e.g. this
  // channel was just clicked in a grid rather than loaded via its own
  // page): that first fetch happens immediately, not on the next tick.
  useEffect(() => {
    let cancelled = false;

    const resync = async () => {
      const latest = await fetchNowPlaying();
      if (cancelled || !latest) return;

      // Always take the fresh response, even when the video url is
      // unchanged — `upcoming` (the preload lookahead) updates on every
      // poll regardless of whether a transition has happened yet, and
      // discarding it here would mean it never reaches the preload
      // element. The src-loading effect below only re-fires when
      // `video.url` itself actually differs, so this doesn't cause
      // extra reloads.
      setNowPlaying(latest);
    };

    if (!initialNowPlaying) resync();

    resyncTimer.current = setInterval(resync, RESYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(resyncTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  // The current program finished playing — jump straight to whatever
  // should be on now instead of waiting for the next resync tick, so
  // playback never just sits there paused at the end.
  //
  // When the next thing to play is the SAME video (a one-video "all
  // time" pool looping, or the pool wrapping back around to where it
  // started), `nowPlaying`'s url doesn't change — and the src-loading
  // effect below is keyed on that url, so it would never re-fire and the
  // element would stay stuck on "ended" forever. Reseek and replay the
  // existing element directly for that case instead of going through
  // the effect.
  const handleEnded = async () => {
    // Suppress the big "tap to play" overlay for the brief gap while we
    // fetch what's next — the native `pause` that fires alongside `ended`
    // would otherwise flash it on screen for every single loop/transition.
    setBuffering(true);

    const latest = await fetchNowPlaying();
    if (!latest?.video?.url) return;

    const video = videoRef.current;
    if (video && latest.video.url === nowPlaying?.video?.url) {
      video.currentTime = latest.offsetSeconds || 0;
      video.play().catch(() => {});
    }

    setNowPlaying(latest);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play();
      trackAction("Resumed Live TV", title);
    } else {
      video.pause();
      trackAction("Paused Live TV", title);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    trackAction(video.muted ? "Muted Live TV" : "Unmuted Live TV", title);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      trackAction("Entered fullscreen", title);
    } else {
      document.exitFullscreen?.();
      trackAction("Exited fullscreen", title);
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // AdOverlay mutes/unmutes this element directly during a video ad — pick
  // that up here instead of new prop plumbing back out of AdOverlay.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const onVolumeChange = () => setMuted(video.muted);
    video.addEventListener("volumechange", onVolumeChange);
    return () => video.removeEventListener("volumechange", onVolumeChange);
  }, []);

  const resetHideTimer = (stillPlaying = playing) => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (stillPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return (
    <div
      ref={containerRef}
      onMouseMove={() => resetHideTimer()}
      className="group relative aspect-video w-full overflow-hidden rounded-sm border border-[#16d6dc]/20 bg-black shadow-2xl shadow-black/40 sm:rounded-2xl"
    >
      <video
        ref={videoRef}
        poster={poster}
        className="h-full w-full cursor-pointer bg-black object-contain"
        onClick={togglePlay}
        playsInline
        onPlay={() => {
          setPlaying(true);
          setHasStarted(true);
          resetHideTimer(true);
        }}
        onPause={() => {
          setPlaying(false);
          setShowControls(true);
        }}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onPlaying={() => setBuffering(false)}
        onEnded={handleEnded}
      />

      {/* Silently preloads the next scheduled video's file a few seconds
          before it airs (server only sends `upcoming` inside that
          window) — never rendered/played, just gets the bytes into the
          browser's cache so the real switch a moment later is instant. */}
      {nowPlaying?.upcoming?.video?.url && (
        <video
          key={nowPlaying.upcoming.video.url}
          src={nowPlaying.upcoming.video.url}
          preload="auto"
          muted
          className="hidden"
          aria-hidden="true"
        />
      )}

      <AdOverlay
        videoRef={videoRef}
        mode="mute"
        campaigns={campaigns}
        playbackStarted={hasStarted}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center">
          <p className="text-sm font-semibold text-slate-200">
            This channel is currently unavailable. Please try another channel.
          </p>
        </div>
      )}

      {!error && buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#16d6dc]" />
        </div>
      )}

      {!error && !buffering && !playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/25 transition hover:bg-black/35"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#5eeaf2] via-[#16d6dc] to-[#0e7a90] shadow-[0_0_50px_rgba(22,214,220,0.5)] transition group-hover:scale-110">
            <Play className="ml-1 h-9 w-9 text-black" fill="black" />
          </span>
        </button>
      )}

      {title && (!playing || showControls) && (
        <div className="pointer-events-none absolute left-0 top-0 flex w-full items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-5 py-4">
          <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
            LIVE
          </span>
          <p className="truncate text-sm font-bold text-white sm:text-base">
            {title}
          </p>
        </div>
      )}

      {!error && (
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${
            showControls || !playing ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="cursor-pointer text-white transition hover:text-[#16d6dc]"
            >
              {playing ? (
                <Pause className="h-6 w-6" fill="currentColor" />
              ) : (
                <Play className="h-6 w-6" fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="cursor-pointer text-white transition hover:text-[#16d6dc]"
            >
              {muted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="cursor-pointer text-white transition hover:text-[#16d6dc]"
          >
            {fullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduledLiveTvPlayer;
