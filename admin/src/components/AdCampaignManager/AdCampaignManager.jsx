import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Calendar,
  Film,
  ImageUp,
  Move,
  Pencil,
  Power,
  Save,
  Search,
  Timer,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { api } from "../../api/axios";
import UploadProgressModal from "../UploadProgressModal/UploadProgressModal";
import { isUploadCancelled, useUploadProgress } from "../../hooks/useUploadProgress";
import {
  TARGET_SCOPES,
  IMAGE_AD_SECTIONS,
  IMAGE_AD_DEFAULT_POSITIONS,
  IMAGE_AD_DEFAULT_SIZES,
  MIN_SECTION_SIZE_PERCENT,
} from "../../constants/adsOptions";

const todayISO = () => new Date().toISOString().slice(0, 10);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const emptySections = () =>
  IMAGE_AD_SECTIONS.reduce((acc, section) => {
    const fallbackPos = IMAGE_AD_DEFAULT_POSITIONS[section.key];
    const fallbackSize = IMAGE_AD_DEFAULT_SIZES[section.key];
    acc[section.key] = {
      file: null,
      preview: null,
      url: "",
      existingImage: null,
      remove: false,
      positionX: fallbackPos.x,
      positionY: fallbackPos.y,
      width: fallbackSize.width,
      height: fallbackSize.height,
    };
    return acc;
  }, {});

const AdCampaignManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");

  const [adVideoFile, setAdVideoFile] = useState(null);
  const [adVideoPreview, setAdVideoPreview] = useState(null);
  const [existingAdVideoUrl, setExistingAdVideoUrl] = useState(null);
  const [skipAfterSeconds, setSkipAfterSeconds] = useState(5);
  const [clickUrl, setClickUrl] = useState("");

  const [sections, setSections] = useState(emptySections());
  const [displayDurationSeconds, setDisplayDurationSeconds] = useState(10);

  const [videoScope, setVideoScope] = useState("all");
  const [liveTvScope, setLiveTvScope] = useState("all");

  const [videoSearch, setVideoSearch] = useState("");
  const [videoResults, setVideoResults] = useState([]);
  const [searchingVideo, setSearchingVideo] = useState(false);
  const [targetVideoId, setTargetVideoId] = useState("");
  const [targetVideoLabel, setTargetVideoLabel] = useState("");

  const [liveTvChannels, setLiveTvChannels] = useState([]);
  const [targetLiveTvId, setTargetLiveTvId] = useState("");

  const [scheduleType, setScheduleType] = useState("campaign");
  const [endDate, setEndDate] = useState("");
  const [enabled, setEnabled] = useState(true);

  const [firstDelaySeconds, setFirstDelaySeconds] = useState(30);
  const [intervalSeconds, setIntervalSeconds] = useState(120);

  const [saving, setSaving] = useState(false);

  const { upload, start, reportSent, complete, fail, cancel, reset } =
    useUploadProgress();
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const mockupFrameRef = useRef(null);
  // Direct-DOM drag/resize (see the block below `handleSectionUrlChange`)
  // — these refs back that, kept up here with the component's other refs.
  const boxRefs = useRef({});
  const dragStateRef = useRef(null); // { key, mode: "move" | "resize" } | null
  const liveValuesRef = useRef({}); // { [key]: { positionX, positionY, width, height } } — authoritative *during* a drag
  const dragOffsetRef = useRef({ x: 0, y: 0 }); // grab point, so the box doesn't jump to be centered under the cursor
  const pendingMoveRef = useRef(null);
  const rafRef = useRef(null);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/ad-campaigns");
      setCampaigns(data?.data?.campaigns || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load ad campaigns");
    } finally {
      setLoading(false);
    }
  };

  const loadLiveTvChannels = async () => {
    try {
      const { data } = await api.get("/api/admin/site/live-tv-channels");
      setLiveTvChannels(data?.data?.channels || []);
    } catch {
      // Non-critical — the single-channel select will just show empty.
    }
  };

  useEffect(() => {
    const init = () => {
      loadCampaigns();
      loadLiveTvChannels();
    };

    init();
  }, []);

  useEffect(() => {
    const skip = () => {
      setVideoResults([]);
    };

    if (videoScope !== "single" || targetVideoId || !videoSearch.trim()) {
      skip();
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingVideo(true);
        const { data } = await api.get("/api/admin/videos", {
          params: { search: videoSearch.trim(), status: "active", limit: 8 },
        });
        setVideoResults(data?.data?.videos || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Video search failed");
      } finally {
        setSearchingVideo(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [videoSearch, targetVideoId, videoScope]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setType("video");
    setAdVideoFile(null);
    setAdVideoPreview(null);
    setExistingAdVideoUrl(null);
    setSkipAfterSeconds(5);
    setClickUrl("");
    setSections(emptySections());
    setDisplayDurationSeconds(10);
    setVideoScope("all");
    setLiveTvScope("all");
    setVideoSearch("");
    setVideoResults([]);
    setTargetVideoId("");
    setTargetVideoLabel("");
    setTargetLiveTvId("");
    setScheduleType("campaign");
    setEndDate("");
    setEnabled(true);
    setFirstDelaySeconds(30);
    setIntervalSeconds(120);
  };

  const startEdit = (campaign) => {
    setEditingId(campaign._id);
    setTitle(campaign.title);
    setType(campaign.type);
    setAdVideoFile(null);
    setAdVideoPreview(null);
    setExistingAdVideoUrl(campaign.type === "video" ? campaign.video?.url || null : null);
    setSkipAfterSeconds(campaign.skipAfterSeconds ?? 5);
    setClickUrl(campaign.clickUrl || "");

    const nextSections = emptySections();
    if (campaign.type === "image" && campaign.imageSections) {
      IMAGE_AD_SECTIONS.forEach(({ key }) => {
        const existing = campaign.imageSections[key];
        const fallbackPos = IMAGE_AD_DEFAULT_POSITIONS[key];
        const fallbackSize = IMAGE_AD_DEFAULT_SIZES[key];
        // An empty slot's stored position/size is just an unused schema
        // default (0), not a real placement — show the sensible default
        // instead so a freshly-filled slot doesn't jump to the top-left
        // at zero size.
        const hasImage = Boolean(existing?.image);
        nextSections[key] = {
          file: null,
          preview: null,
          remove: false,
          url: existing?.url || "",
          existingImage: existing?.image || null,
          positionX: hasImage ? (existing?.positionX ?? fallbackPos.x) : fallbackPos.x,
          positionY: hasImage ? (existing?.positionY ?? fallbackPos.y) : fallbackPos.y,
          width: hasImage ? existing?.width || fallbackSize.width : fallbackSize.width,
          height: hasImage ? existing?.height || fallbackSize.height : fallbackSize.height,
        };
      });
    }
    setSections(nextSections);
    setDisplayDurationSeconds(campaign.displayDurationSeconds ?? 10);

    setVideoScope(campaign.videoScope || "all");
    setLiveTvScope(campaign.liveTvScope || "all");
    setVideoSearch("");
    setVideoResults([]);
    setTargetVideoId(campaign.targetVideo?._id || "");
    setTargetVideoLabel(campaign.targetVideo?.title || "");
    setTargetLiveTvId(campaign.targetLiveTvChannel?._id || "");

    setScheduleType(campaign.scheduleType);
    setEndDate(campaign.endDate ? campaign.endDate.slice(0, 10) : "");
    setEnabled(campaign.enabled !== false);
    setFirstDelaySeconds(campaign.firstDelaySeconds ?? 30);
    setIntervalSeconds(campaign.intervalSeconds ?? 120);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdVideoFile(file);
    setAdVideoPreview(URL.createObjectURL(file));
  };

  const handleSectionFileChange = (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Section image must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], file, preview: URL.createObjectURL(file), remove: false },
    }));
  };

  const handleSectionUrlChange = (key, value) => {
    setSections((prev) => ({ ...prev, [key]: { ...prev[key], url: value } }));
  };

  const handleSectionClear = (key) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], file: null, preview: null, remove: true },
    }));
  };

  // Drag-to-position and drag-to-resize for the mockup preview —
  // percentage-based (of the mockup frame's own width/height) so a
  // section renders at the *exact* same proportion here as it does on
  // the real client frame (client/src/components/AdOverlay/AdOverlay.jsx
  // sizes the same way against its own frame) — true 1:1 WYSIWYG at any
  // real player width, not just an approximation.
  //
  // During an active drag, position/size updates bypass React state
  // entirely — mutating the box's own DOM style directly via boxRefs —
  // so dragging tracks the pointer at full frame rate regardless of how
  // much the rest of this form re-renders. `liveValuesRef` holds the
  // authoritative in-progress values; `sections` state is only updated
  // once, on pointerup, to persist the final result.
  const applyLiveStyle = (key) => {
    const el = boxRefs.current[key];
    const live = liveValuesRef.current[key];
    if (!el || !live) return;
    el.style.left = `${live.positionX}%`;
    el.style.top = `${live.positionY}%`;
    el.style.width = `${live.width}%`;
    el.style.height = `${live.height}%`;
  };

  const pointerToFramePercent = (clientX, clientY) => {
    const frame = mockupFrameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMovePointerDown = (key) => (event) => {
    event.preventDefault();
    const point = pointerToFramePercent(event.clientX, event.clientY);
    if (!point) return;

    const current = sections[key];
    dragOffsetRef.current = { x: point.x - current.positionX, y: point.y - current.positionY };
    liveValuesRef.current[key] = { ...current };
    dragStateRef.current = { key, mode: "move" };
  };

  const handleResizePointerDown = (key) => (event) => {
    event.preventDefault();
    event.stopPropagation(); // don't also trigger the box's own move handler
    liveValuesRef.current[key] = { ...sections[key] };
    dragStateRef.current = { key, mode: "resize" };
  };

  const applyMove = (key, clientX, clientY) => {
    const point = pointerToFramePercent(clientX, clientY);
    const live = liveValuesRef.current[key];
    if (!point || !live) return;

    const rawX = point.x - dragOffsetRef.current.x;
    const rawY = point.y - dragOffsetRef.current.y;
    live.positionX = key === "bottomBanner" ? 0 : clamp(rawX, 0, 100 - live.width);
    live.positionY = clamp(rawY, 0, 100 - live.height);
    applyLiveStyle(key);
  };

  const applyResize = (key, clientX, clientY) => {
    const point = pointerToFramePercent(clientX, clientY);
    const live = liveValuesRef.current[key];
    if (!point || !live) return;

    const rawWidth = point.x - live.positionX;
    const rawHeight = point.y - live.positionY;
    live.width =
      key === "bottomBanner"
        ? 100
        : clamp(rawWidth, MIN_SECTION_SIZE_PERCENT, 100 - live.positionX);
    live.height = clamp(rawHeight, MIN_SECTION_SIZE_PERCENT, 100 - live.positionY);
    applyLiveStyle(key);
  };

  // Batches pointermove-driven updates to at most once per animation
  // frame — the browser can fire pointermove far faster than it repaints,
  // so applying every single event is wasted work that can still read as
  // jittery; this caps it to exactly what the screen can actually show.
  const handleFramePointerMove = (event) => {
    if (!dragStateRef.current) return;
    pendingMoveRef.current = { clientX: event.clientX, clientY: event.clientY };

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const drag = dragStateRef.current;
      const pending = pendingMoveRef.current;
      if (!drag || !pending) return;

      if (drag.mode === "move") applyMove(drag.key, pending.clientX, pending.clientY);
      else applyResize(drag.key, pending.clientX, pending.clientY);
    });
  };

  const stopDragging = () => {
    const drag = dragStateRef.current;
    if (drag) {
      const live = liveValuesRef.current[drag.key];
      if (live) {
        setSections((prev) => ({ ...prev, [drag.key]: { ...prev[drag.key], ...live } }));
      }
    }
    dragStateRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    window.addEventListener("pointermove", handleFramePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handleFramePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (videoScope === "single" && !targetVideoId) {
      toast.error("Select a video to target");
      return;
    }

    if (liveTvScope === "single" && !targetLiveTvId) {
      toast.error("Select a Live TV channel to target");
      return;
    }

    if (scheduleType === "campaign" && !endDate) {
      toast.error("Choose an end date for the campaign schedule");
      return;
    }

    if (type === "video" && !editingId && !adVideoFile) {
      toast.error("An ad video file is required");
      return;
    }

    if (type === "image" && !editingId) {
      const hasAny = IMAGE_AD_SECTIONS.some(({ key }) => sections[key].file);
      if (!hasAny) {
        toast.error("Upload at least one section image");
        return;
      }
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("videoScope", videoScope);
      if (videoScope === "single") formData.append("targetVideo", targetVideoId);
      formData.append("liveTvScope", liveTvScope);
      if (liveTvScope === "single") {
        formData.append("targetLiveTvChannel", targetLiveTvId);
      }
      formData.append("scheduleType", scheduleType);
      if (scheduleType === "campaign") {
        formData.append("endDate", new Date(endDate).toISOString());
      }
      formData.append("enabled", String(enabled));
      formData.append("firstDelaySeconds", String(firstDelaySeconds));
      formData.append("intervalSeconds", String(intervalSeconds));

      if (!editingId) formData.append("type", type);

      if (type === "video") {
        if (adVideoFile) formData.append("adVideo", adVideoFile);
        formData.append("skipAfterSeconds", String(skipAfterSeconds));
        formData.append("clickUrl", clickUrl.trim());
      } else {
        IMAGE_AD_SECTIONS.forEach(({ key }) => {
          const section = sections[key];
          if (section.file) formData.append(`${key}Image`, section.file);
          if (section.remove) formData.append(`${key}Remove`, "true");
          formData.append(`${key}Url`, section.url?.trim() || "");
          formData.append(`${key}PositionX`, String(section.positionX));
          formData.append(`${key}PositionY`, String(section.positionY));
          formData.append(`${key}Width`, String(section.width));
          formData.append(`${key}Height`, String(section.height));
        });
        formData.append("displayDurationSeconds", String(displayDurationSeconds));
      }

      // An ad video is the only part of this form big enough to be worth
      // watching; image sections upload in a moment.
      let signal;
      const sendingAdVideo = type === "video" && Boolean(adVideoFile);

      if (sendingAdVideo) {
        signal = start({
          fileName: adVideoFile.name,
          fileSize: adVideoFile.size,
          storedBytes: adVideoFile.size,
        });
      }

      const config = {
        signal,
        onUploadProgress: (event) => {
          if (!event.total) return;
          reportSent(event.loaded, event.total);
        },
      };

      if (editingId) {
        await api.put(`/api/admin/ad-campaigns/${editingId}`, formData, config);
      } else {
        await api.post("/api/admin/ad-campaigns", formData, config);
      }

      if (sendingAdVideo) {
        complete();
        await new Promise((resolve) => setTimeout(resolve, 1400));
        reset();
      }

      toast.success(editingId ? "Ad campaign updated" : "Ad campaign created");
      resetForm();
      loadCampaigns();
    } catch (error) {
      if (isUploadCancelled(error)) {
        reset();
        toast.info("Upload cancelled");
      } else {
        const message = error?.response?.data?.message || "Failed to save ad campaign";
        fail(message);
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Delete "${campaign.title}"?`)) return;

    try {
      setDeletingId(campaign._id);
      await api.delete(`/api/admin/ad-campaigns/${campaign._id}`);
      setCampaigns((prev) => prev.filter((item) => item._id !== campaign._id));
      if (editingId === campaign._id) resetForm();
      toast.success("Ad campaign deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete ad campaign");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (campaign) => {
    try {
      setTogglingId(campaign._id);
      const { data } = await api.patch(`/api/admin/ad-campaigns/${campaign._id}/toggle`);
      const updated = data?.data?.campaign;
      setCampaigns((prev) =>
        prev.map((item) => (item._id === campaign._id ? updated : item)),
      );
      toast.success(updated?.enabled ? "Ad campaign enabled" : "Ad campaign disabled");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to toggle ad campaign");
    } finally {
      setTogglingId(null);
    }
  };

  const targetLabel = (campaign) => {
    const videoPart =
      campaign.videoScope === "single"
        ? `Video: ${campaign.targetVideo?.title || "removed"}`
        : "All Videos";
    const liveTvPart =
      campaign.liveTvScope === "single"
        ? `Live TV: ${campaign.targetLiveTvChannel?.name || "removed"}`
        : "All Live TV";
    return `${videoPart} · ${liveTvPart}`;
  };

  const base = api.defaults.baseURL;

  return (
    <div className="mt-8 space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        <h2 className="mb-4 text-lg font-black text-white">
          {editingId ? "Edit Ad Campaign" : "Add Ad Campaign"}
        </h2>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Eid Special Promo"
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Ad Type
            </label>
            <div className="flex gap-2">
              {["video", "image"].map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(editingId)}
                  onClick={() => setType(option)}
                  className={`flex-1 cursor-pointer rounded-2xl border px-4 py-3 text-sm font-bold capitalize transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    type === option
                      ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                      : "border-[#8b5cf6]/15 bg-black/25 text-slate-400"
                  }`}
                >
                  {option === "video" ? "Video Ad" : "Image / GIF Ad"}
                </button>
              ))}
            </div>
            {editingId && (
              <p className="mt-1.5 text-[11px] text-slate-500">
                Ad type can't be changed after creation — delete and recreate instead.
              </p>
            )}
          </div>

          {type === "video" ? (
            <div className="space-y-4 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 p-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Ad Video {editingId && "(leave empty to keep the current one)"}
                </label>
                <input
                  type="file"
                  id="ad-video-input"
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
                  onChange={handleAdVideoChange}
                  className="hidden"
                />
                <label
                  htmlFor="ad-video-input"
                  className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {adVideoFile ? adVideoFile.name : "Choose Video File"}
                </label>

                {(adVideoPreview || existingAdVideoUrl) && (
                  <video
                    key={adVideoPreview || existingAdVideoUrl}
                    src={adVideoPreview || existingAdVideoUrl}
                    controls
                    className="mt-3 h-56 w-full rounded-xl border border-[#8b5cf6]/25 bg-black object-contain"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Skip button after (seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={skipAfterSeconds}
                    onChange={(e) => setSkipAfterSeconds(e.target.value)}
                    className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Click URL
                  </label>
                  <input
                    type="text"
                    value={clickUrl}
                    onChange={(e) => setClickUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-xs text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 p-4">
              <p className="text-xs text-slate-400">
                Fill in any of the 4 positions, then on the frame below
                drag a box to move it and drag its corner handle (bottom
                edge for Bottom Banner) to resize it — exactly where and
                how big you place it here is exactly what viewers see.
              </p>

              <div
                ref={mockupFrameRef}
                className="relative aspect-video w-full touch-none select-none overflow-hidden rounded-xl border border-[#8b5cf6]/20 bg-black/50"
              >
                <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-[11px] text-slate-600">
                  Video / Live TV frame
                </p>

                {IMAGE_AD_SECTIONS.map(({ key, label }) => {
                  const section = sections[key];
                  const previewSrc =
                    section.preview ||
                    (section.existingImage && !section.remove
                      ? `${base}${section.existingImage}`
                      : null);

                  if (!previewSrc) return null;

                  return (
                    <div
                      key={key}
                      ref={(el) => {
                        boxRefs.current[key] = el;
                      }}
                      onPointerDown={handleMovePointerDown(key)}
                      style={{
                        left: `${section.positionX}%`,
                        top: `${section.positionY}%`,
                        width: `${section.width}%`,
                        height: `${section.height}%`,
                      }}
                      className="group absolute cursor-grab overflow-hidden rounded border border-white/50 bg-white shadow-lg active:cursor-grabbing"
                    >
                      <img
                        src={previewSrc}
                        alt={label}
                        draggable={false}
                        className="pointer-events-none h-full w-full select-none object-cover"
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                        <Move className="h-4 w-4 text-white" />
                      </span>

                      {/* Resize handle — corner grip for the 3 free-size
                          sections, bottom-edge only for bottomBanner
                          (its width is always locked full-frame). */}
                      <span
                        onPointerDown={handleResizePointerDown(key)}
                        title="Drag to resize"
                        className={`absolute bottom-0 flex h-4 w-4 cursor-nwse-resize items-center justify-center rounded-tl bg-[#8b5cf6] opacity-70 transition hover:opacity-100 ${
                          key === "bottomBanner" ? "inset-x-0 mx-auto cursor-ns-resize" : "right-0"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {IMAGE_AD_SECTIONS.map(({ key, label }) => {
                  const section = sections[key];
                  const previewSrc =
                    section.preview ||
                    (section.existingImage && !section.remove
                      ? `${base}${section.existingImage}`
                      : null);

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-[#8b5cf6]/15 bg-black/25 p-3"
                    >
                      <p className="text-xs font-bold text-violet-200">{label}</p>
                      <p className="mb-2 text-[10px] text-slate-400">
                        {key === "bottomBanner"
                          ? `Full width · ${section.height.toFixed(1)}% tall`
                          : `${section.width.toFixed(1)}% × ${section.height.toFixed(1)}% of the frame`}
                      </p>

                      <div className="mb-2 flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-[#8b5cf6]/25 bg-black/30">
                        {previewSrc ? (
                          <img
                            src={previewSrc}
                            alt={label}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageUp className="h-6 w-6 text-slate-500" />
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="file"
                          id={`section-input-${key}`}
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={(e) => handleSectionFileChange(key, e)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`section-input-${key}`}
                          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-3 py-1.5 text-[11px] font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
                        >
                          <ImageUp className="h-3 w-3" />
                          Choose
                        </label>

                        {previewSrc && (
                          <button
                            type="button"
                            onClick={() => handleSectionClear(key)}
                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-300 transition hover:bg-rose-500/20"
                          >
                            <X className="h-3 w-3" />
                            Clear
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={section.url}
                        onChange={(e) => handleSectionUrlChange(key, e.target.value)}
                        placeholder="Click URL for this position"
                        className="mt-2 w-full rounded-xl border border-[#8b5cf6]/20 bg-black/35 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="max-w-xs">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Display duration (seconds)
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayDurationSeconds}
                  onChange={(e) => setDisplayDurationSeconds(e.target.value)}
                  className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Video Target
              </label>
              <div className="flex gap-2">
                {TARGET_SCOPES.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setVideoScope(option.key);
                      setTargetVideoId("");
                      setTargetVideoLabel("");
                    }}
                    className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                      videoScope === option.key
                        ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                        : "border-[#8b5cf6]/15 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
                    }`}
                  >
                    {option.key === "all" ? "All Videos" : "Single Video"}
                  </button>
                ))}
              </div>

              {videoScope === "single" && (
                <div className="mt-3">
                  {targetVideoId ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/25 bg-black/30 p-3">
                      <p className="flex-1 truncate text-sm font-bold text-white">
                        {targetVideoLabel}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetVideoId("");
                          setTargetVideoLabel("");
                        }}
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/20"
                      >
                        <X className="h-3.5 w-3.5" />
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b5cf6]" />
                        <input
                          type="text"
                          value={videoSearch}
                          onChange={(e) => setVideoSearch(e.target.value)}
                          placeholder="Search active videos by title..."
                          className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                        />
                      </div>

                      {searchingVideo && (
                        <p className="mt-2 text-xs text-slate-400">Searching...</p>
                      )}

                      {videoResults.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {videoResults.map((video) => (
                            <button
                              key={video.id}
                              type="button"
                              onClick={() => {
                                setTargetVideoId(video.id);
                                setTargetVideoLabel(video.title);
                                setVideoResults([]);
                              }}
                              className="flex w-full cursor-pointer items-center gap-2 truncate rounded-xl border border-[#8b5cf6]/15 bg-black/25 px-4 py-2 text-left text-sm font-semibold text-slate-200 transition hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10 hover:text-white"
                            >
                              <Film className="h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />
                              <span className="truncate">{video.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Live TV Target
              </label>
              <div className="flex gap-2">
                {TARGET_SCOPES.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setLiveTvScope(option.key);
                      setTargetLiveTvId("");
                    }}
                    className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                      liveTvScope === option.key
                        ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                        : "border-[#8b5cf6]/15 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
                    }`}
                  >
                    {option.key === "all" ? "All Live TV" : "Single Live TV"}
                  </button>
                ))}
              </div>

              {liveTvScope === "single" && (
                <select
                  value={targetLiveTvId}
                  onChange={(e) => setTargetLiveTvId(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                >
                  <option value="">Select a Live TV channel...</option>
                  {liveTvChannels.map((channel) => (
                    <option key={channel._id} value={channel._id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Schedule
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setScheduleType("campaign")}
                className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                  scheduleType === "campaign"
                    ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                    : "border-[#8b5cf6]/15 bg-black/25 text-slate-400"
                }`}
              >
                Campaign
              </button>
              <button
                type="button"
                onClick={() => setScheduleType("lifetime")}
                className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                  scheduleType === "lifetime"
                    ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                    : "border-[#8b5cf6]/15 bg-black/25 text-slate-400"
                }`}
              >
                Lifetime
              </button>
            </div>

            {scheduleType === "campaign" && (
              <div className="relative mt-3 max-w-xs">
                <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b5cf6]" />
                <input
                  type="date"
                  value={endDate}
                  min={todayISO()}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-2.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#8b5cf6]/15 bg-black/20 p-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Timer className="h-4 w-4 text-[#8b5cf6]" />
              Rotation Timing (this campaign only)
            </label>
            <p className="mb-3 text-[11px] text-slate-400">
              Each campaign runs on its own clock — these values don't affect
              any other ad campaign.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  First ad after (seconds)
                </label>
                <input
                  type="number"
                  min={0}
                  value={firstDelaySeconds}
                  onChange={(e) => setFirstDelaySeconds(e.target.value)}
                  className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Repeat every (seconds)
                </label>
                <input
                  type="number"
                  min={1}
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(e.target.value)}
                  className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                />
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[#8b5cf6]"
            />
            <span className="text-sm text-slate-200">Enabled</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : editingId ? "Update Campaign" : "Create Campaign"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-black/30 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#8b5cf6]/15"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <h2 className="mb-4 text-lg font-black text-white">
          Ad Campaigns {campaigns.length > 0 && `(${campaigns.length})`}
        </h2>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No ad campaigns yet — add one above.
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="flex flex-col gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/25 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-white">
                      {campaign.title}
                    </p>
                    <span className="rounded-full bg-[#8b5cf6]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-300">
                      {campaign.type}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        campaign.enabled
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {campaign.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {targetLabel(campaign)}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-[11px] text-violet-300">
                    <Calendar className="h-3 w-3" />
                    {campaign.scheduleType === "lifetime"
                      ? "Lifetime"
                      : `Until ${new Date(campaign.endDate).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleToggle(campaign)}
                    disabled={togglingId === campaign._id}
                    className="flex cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-3 py-2 text-violet-200 transition hover:bg-[#8b5cf6]/25 disabled:opacity-60"
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => startEdit(campaign)}
                    className="flex cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-3 py-2 text-violet-200 transition hover:bg-[#8b5cf6]/25"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign)}
                    disabled={deletingId === campaign._id}
                    className="flex cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2 text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadProgressModal upload={upload} onClose={reset} onCancel={cancel} />
    </div>
  );
};

export default AdCampaignManager;
