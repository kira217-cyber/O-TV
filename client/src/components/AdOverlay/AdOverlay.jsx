import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { SkipForward } from "lucide-react";

import { api } from "../../api/axios";

// Fixed screen positions for the 4 image-ad sections an admin can fill —
// exact px sizes kept in sync with IMAGE_AD_SECTION_SIZES in the admin app
// (admin/src/constants/adsOptions.js) so the upload hints match reality.
// Smaller on mobile (screen is small) than on desktop (sm: breakpoint up).
const SECTION_POSITION_CLASSES = {
  topLeft: "left-2 top-2 h-[150px] w-[110px] sm:left-3 sm:top-3 sm:h-[280px] sm:w-[200px]",
  topRight: "right-2 top-2 h-[60px] w-[100px] sm:right-3 sm:top-3 sm:h-[110px] sm:w-[180px]",
  bottomRight:
    "right-2 top-[76px] h-[60px] w-[100px] sm:right-3 sm:top-[134px] sm:h-[110px] sm:w-[180px]",
  bottomBanner: "inset-x-2 bottom-2 h-[40px] sm:inset-x-3 sm:bottom-3 sm:h-[70px]",
};

// Shared ad-rotation engine mounted inside both VideoPlayer (mode="pause")
// and HlsPlayer (mode="mute") — controls the same <video> element they own
// via videoRef, so their own play/pause/mute state stays in sync through
// native video events instead of new prop plumbing.
//
// Exposes { pause, resume } via ref so a scroll-driven feed (Shorts) can
// silence/continue the ad's own <video> when it scrolls off/back into
// view — the ad's rotation state is untouched, so coming back mid-ad
// resumes it right where it left off, like a paused reel on Facebook.
//
// Timing is per-campaign (firstDelaySeconds/intervalSeconds live on each
// campaign, not a shared site-wide clock), so every campaign schedules
// itself independently. If two campaigns' timers fire while one is
// already showing, the other queues and shows immediately after — only
// one ad is ever on screen at once, but each keeps its own cadence.
const AdOverlay = forwardRef(({ videoRef, mode, campaigns, playbackStarted }, ref) => {
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [skipVisible, setSkipVisible] = useState(false);

  const adVideoRef = useRef(null);
  const activeRef = useRef(null);
  const showTimersRef = useRef(new Map());
  const queueRef = useRef([]);
  const hideTimerRef = useRef(null);
  const skipTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    pause: () => {
      adVideoRef.current?.pause();
    },
    resume: () => {
      adVideoRef.current?.play().catch(() => {});
    },
  }));

  const clearShowTimer = (id) => {
    const timer = showTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      showTimersRef.current.delete(id);
    }
  };

  const scheduleCampaign = (campaign, delaySeconds) => {
    clearShowTimer(campaign.id);
    const timer = setTimeout(
      () => attemptShow(campaign),
      Math.max(0, delaySeconds) * 1000,
    );
    showTimersRef.current.set(campaign.id, timer);
  };

  const showCampaign = (campaign) => {
    activeRef.current = campaign;
    setActiveCampaign(campaign);

    if (campaign.type === "video") {
      const video = videoRef.current;
      if (video) {
        if (mode === "pause") video.pause();
        else video.muted = true;
      }

      setSkipVisible(false);
      skipTimerRef.current = setTimeout(
        () => setSkipVisible(true),
        Math.max(0, (campaign.skipAfterSeconds ?? 5) * 1000),
      );
    } else {
      hideTimerRef.current = setTimeout(
        endCurrentAd,
        Math.max(1, campaign.displayDurationSeconds ?? 10) * 1000,
      );
    }
  };

  const attemptShow = (campaign) => {
    if (activeRef.current) {
      if (!queueRef.current.some((item) => item.id === campaign.id)) {
        queueRef.current.push(campaign);
      }
      return;
    }

    showCampaign(campaign);
  };

  const endCurrentAd = () => {
    const finished = activeRef.current;

    clearTimeout(hideTimerRef.current);
    clearTimeout(skipTimerRef.current);
    setSkipVisible(false);
    setActiveCampaign(null);
    activeRef.current = null;

    const video = videoRef.current;
    if (video) {
      if (mode === "pause") video.play().catch(() => {});
      else video.muted = false;
    }

    if (finished) {
      scheduleCampaign(finished, finished.intervalSeconds ?? 120);
    }

    const next = queueRef.current.shift();
    if (next) showCampaign(next);
  };

  useEffect(() => {
    if (!playbackStarted || !campaigns || campaigns.length === 0) return undefined;

    campaigns.forEach((campaign) => {
      scheduleCampaign(campaign, campaign.firstDelaySeconds ?? 30);
    });

    return () => {
      showTimersRef.current.forEach((timer) => clearTimeout(timer));
      showTimersRef.current.clear();
      queueRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackStarted, campaigns]);

  useEffect(
    () => () => {
      clearTimeout(hideTimerRef.current);
      clearTimeout(skipTimerRef.current);
      showTimersRef.current.forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  if (!activeCampaign) return null;

    if (activeCampaign.type === "video") {
      return (
        <div className="absolute inset-0 z-30 bg-black">
          <video
            ref={adVideoRef}
            key={activeCampaign.id}
            src={activeCampaign.video?.url}
            autoPlay
            playsInline
            className="h-full w-full cursor-pointer object-contain"
            onClick={() => {
              if (activeCampaign.clickUrl) {
                window.open(activeCampaign.clickUrl, "_blank", "noreferrer");
              }
            }}
            onEnded={endCurrentAd}
          />

          <span className="pointer-events-none absolute left-4 top-4 rounded bg-black/60 px-2 py-1 text-[11px] font-bold text-white">
            Ad
          </span>

          {skipVisible && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                endCurrentAd();
              }}
              className="absolute bottom-4 right-4 flex cursor-pointer items-center gap-1.5 rounded-full bg-black/70 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-black/85"
            >
              Skip Ad
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      );
    }

    const sections = activeCampaign.imageSections || {};
    const base = api.defaults.baseURL;

    return (
      <>
        {Object.entries(SECTION_POSITION_CLASSES).map(([key, positionClass]) => {
          const section = sections[key];
          if (!section?.image) return null;

          return (
            <a
              key={key}
              href={section.url || undefined}
              target={section.url ? "_blank" : undefined}
              rel={section.url ? "noreferrer" : undefined}
              onClick={(event) => {
                if (!section.url) event.preventDefault();
              }}
              className={`absolute z-30 overflow-hidden rounded-lg border border-white/20 shadow-lg shadow-black/40 ${positionClass} ${
                section.url ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <img
                src={`${base}${section.image}`}
                alt="Advertisement"
                className="h-full w-full object-cover"
              />
            </a>
          );
        })}
      </>
    );
});

AdOverlay.displayName = "AdOverlay";

export default AdOverlay;
