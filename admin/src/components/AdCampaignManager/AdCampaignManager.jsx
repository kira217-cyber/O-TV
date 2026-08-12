import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Calendar,
  Film,
  ImageUp,
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
import {
  TARGET_SCOPES,
  IMAGE_AD_SECTIONS,
  IMAGE_AD_SECTION_SIZES,
} from "../../constants/adsOptions";

const todayISO = () => new Date().toISOString().slice(0, 10);

// Mirrors client/src/components/AdOverlay/AdOverlay.jsx's on-screen layout,
// scaled down for the mockup preview frame in this form.
const MOCKUP_POSITION_CLASSES = {
  topLeft: "left-2 top-2 h-16 w-24 sm:h-20 sm:w-28",
  topRight: "right-2 top-2 h-14 w-20 sm:h-16 sm:w-24",
  bottomRight: "right-2 top-20 h-14 w-20 sm:top-24 sm:h-16 sm:w-24",
  bottomBanner: "inset-x-2 bottom-2 h-8 sm:h-10",
};

const emptySections = () =>
  IMAGE_AD_SECTIONS.reduce((acc, section) => {
    acc[section.key] = {
      file: null,
      preview: null,
      url: "",
      existingImage: null,
      remove: false,
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
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

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
        nextSections[key] = {
          file: null,
          preview: null,
          remove: false,
          url: existing?.url || "",
          existingImage: existing?.image || null,
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
        });
        formData.append("displayDurationSeconds", String(displayDurationSeconds));
      }

      if (editingId) {
        await api.put(`/api/admin/ad-campaigns/${editingId}`, formData);
        toast.success("Ad campaign updated");
      } else {
        await api.post("/api/admin/ad-campaigns", formData);
        toast.success("Ad campaign created");
      }

      resetForm();
      loadCampaigns();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save ad campaign");
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
                Fill in any of the 4 positions — leave the rest empty. The
                frame below previews exactly where each one will appear.
              </p>

              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#8b5cf6]/20 bg-black/50">
                <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-[11px] text-slate-600">
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
                      className={`absolute overflow-hidden rounded border border-white/50 bg-white shadow-lg ${MOCKUP_POSITION_CLASSES[key]}`}
                    >
                      <img
                        src={previewSrc}
                        alt={label}
                        className="h-full w-full object-cover"
                      />
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
                        Desktop {IMAGE_AD_SECTION_SIZES[key].desktop} · Mobile{" "}
                        {IMAGE_AD_SECTION_SIZES[key].mobile}
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
    </div>
  );
};

export default AdCampaignManager;
