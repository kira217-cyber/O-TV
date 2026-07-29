import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

const HlsPlayer = ({ src, poster, title }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const hideTimer = useRef(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!started) return;

    const video = videoRef.current;
    if (!video || !src) return;

    const attach = () => {
      setError(false);

      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data?.fatal) setError(true);
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {});
        });
        video.addEventListener("error", () => setError(true));
      } else {
        setError(true);
      }
    };

    attach();

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [started, src]);

  const togglePlay = () => {
    if (!started) {
      setStarted(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
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
      className="group relative aspect-video w-full overflow-hidden rounded-[28px] border border-[#16d6dc]/20 bg-black shadow-2xl shadow-black/40"
    >
      {started ? (
        <video
          ref={videoRef}
          poster={poster}
          className="h-full w-full cursor-pointer bg-black object-contain"
          onClick={togglePlay}
          playsInline
          onPlay={() => {
            setPlaying(true);
            resetHideTimer(true);
          }}
          onPause={() => {
            setPlaying(false);
            setShowControls(true);
          }}
        />
      ) : (
        poster && (
          <img
            src={poster}
            alt={title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        )
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center">
          <p className="text-sm font-semibold text-slate-200">
            This channel is currently unavailable. Please try another channel.
          </p>
        </div>
      )}

      {!error && (!started || !playing) && (
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

      {started && !error && (
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

export default HlsPlayer;
