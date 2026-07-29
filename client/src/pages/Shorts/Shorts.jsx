import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Volume2, VolumeX } from "lucide-react";

import { api } from "../../api/axios";

const ShortItem = ({ video, base }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    const videoEl = videoRef.current;
    if (!el || !videoEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    setMuted(videoEl.muted);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full snap-start snap-always overflow-hidden rounded-2xl bg-black"
    >
      <video
        ref={videoRef}
        src={video.video?.url}
        poster={`${base}${video.thumbnail?.portrait}`}
        className="h-full w-full cursor-pointer object-contain"
        muted
        loop
        playsInline
        onClick={toggleMute}
      />

      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-4 pb-6 pt-16">
        <Link
          to={`/watch/${video.id}`}
          className="pointer-events-auto inline-block text-base font-bold text-white hover:text-[#16d6dc]"
        >
          {video.title}
        </Link>
        <p className="mt-1 truncate text-sm text-slate-300">
          {video.channelName}
        </p>
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
    <div className="mx-auto w-full max-w-[560px] px-4 pb-6 pt-6 text-white">
      <h1 className="mb-4 text-2xl font-bold text-white sm:text-3xl">Shorts</h1>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
          Loading...
        </div>
      ) : videos.length === 0 ? (
        <p className="py-16 text-center text-slate-400">
          No shorts available right now.
        </p>
      ) : (
        <div className="h-[calc(100dvh-220px)] snap-y snap-mandatory space-y-3 overflow-y-auto pb-3">
          {videos.map((video) => (
            <ShortItem key={video.id} video={video} base={base} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shorts;
