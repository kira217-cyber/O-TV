import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ImageUp,
  Save,
  Trash2,
  X,
  Home as HomeIcon,
  Plus,
  UploadCloud,
  CalendarClock,
  Repeat,
} from "lucide-react";

import { api } from "../../api/axios";

// Probes a *local* video File's real playable duration before it's ever
// uploaded (same technique used for trailer uploads in AdminVideoForm.jsx)
// — needed for the schedule/pool's timing math since nothing here is
// chosen from the site's Video content library.
const probeVideoDuration = (file) =>
  new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";

    const finish = (result) => {
      clearTimeout(timeoutId);
      probe.removeAttribute("src");
      probe.load();
      URL.revokeObjectURL(objectUrl);
      resolve(result);
    };

    const timeoutId = setTimeout(() => finish(null), 8000);

    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration)) {
        finish(probe.duration);
        return;
      }
      probe.currentTime = Number.MAX_SAFE_INTEGER;
      probe.ontimeupdate = () => {
        probe.ontimeupdate = null;
        finish(probe.duration);
      };
    };

    probe.onerror = () => finish(null);
    probe.src = objectUrl;
  });

const formatDuration = (seconds) => {
  if (!seconds) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
};

const makeUploadId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Uploads one raw video File straight to Bunny storage (via the server's
// relay) and returns { url, fileName, originalName, durationSeconds }.
// `onProgress` receives 0-100, combining the client->server leg (0-50%)
// and the server->Bunny leg (50-100%, polled).
const uploadOTvVideo = async (file, onProgress) => {
  const duration = await probeVideoDuration(file);
  if (!Number.isFinite(duration) || duration < 1) {
    toast.error("Could not detect this video's duration — try another file");
    return null;
  }

  const uploadId = makeUploadId();
  const formData = new FormData();
  formData.append("video", file);
  formData.append("uploadId", uploadId);

  let bunnyPercent = 0;
  const pollTimer = setInterval(async () => {
    try {
      const { data } = await api.get(
        `/api/admin/scheduled-live-tv/upload-progress/${uploadId}`,
      );
      bunnyPercent = data?.data?.percent ?? bunnyPercent;
      onProgress((previous) => Math.max(previous, 50 + Math.round(bunnyPercent / 2)));
    } catch {
      // Non-critical — the bar just won't advance this tick.
    }
  }, 400);

  try {
    onProgress(0);
    const { data } = await api.post("/api/admin/scheduled-live-tv/upload-video", formData, {
      onUploadProgress: (event) => {
        if (!event.total) return;
        const clientPercent = Math.round((event.loaded / event.total) * 100);
        onProgress((previous) => Math.max(previous, Math.round(clientPercent / 2)));
      },
    });
    onProgress(100);

    const uploaded = data?.data?.video;
    if (!uploaded?.url) return null;

    return { ...uploaded, durationSeconds: Math.round(duration) };
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to upload video");
    return null;
  } finally {
    clearInterval(pollTimer);
  }
};

// A single upload-and-preview video slot, reused for both the all-time
// pool and the pending schedule-entry video.
const VideoUploadSlot = ({ video, onChange, label, prompt, hint }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file");
      return;
    }

    setUploading(true);
    setProgress(0);
    const uploaded = await uploadOTvVideo(file, setProgress);
    setUploading(false);
    setProgress(0);

    if (uploaded) onChange(uploaded);
  };

  if (video?.url) {
    return (
      <div className="space-y-3 rounded-2xl border border-[#8b5cf6]/25 bg-black/30 p-4">
        <video
          src={video.url}
          controls
          muted
          className="aspect-video w-full rounded-xl bg-black object-contain"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-300">
            {video.originalName || "Uploaded video"}
            {video.durationSeconds ? (
              <span className="ml-2 font-normal text-slate-500">
                ({formatDuration(video.durationSeconds)})
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#8b5cf6]/25 bg-black/15 p-6 text-center transition hover:border-[#8b5cf6]/45 hover:bg-black/20">
      <input
        type="file"
        id={`otv-video-upload-${label}`}
        accept="video/*"
        onChange={handleFile}
        disabled={uploading}
        className="hidden"
      />
      <label
        htmlFor={`otv-video-upload-${label}`}
        className={`flex cursor-pointer flex-col items-center gap-2.5 ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <UploadCloud className="h-8 w-8 text-[#8b5cf6]" />
        <span className="text-sm font-black text-violet-200">
          {uploading ? `Uploading... ${progress}%` : prompt || `Upload ${label}`}
        </span>
        {!uploading && hint && <span className="text-xs text-slate-500">{hint}</span>}
      </label>
      {uploading && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

const OTvManager = () => {
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState(null);

  // Identity panel state
  const [name, setName] = useState("Pipra-TV");
  const [homeFeatured, setHomeFeatured] = useState(false);
  const [categories, setCategories] = useState([]);
  const [listLimit, setListLimit] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showOnList, setShowOnList] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [savingIdentity, setSavingIdentity] = useState(false);

  // Content panel state
  const [allTimeVideos, setAllTimeVideos] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [pendingAllTimeVideo, setPendingAllTimeVideo] = useState(null);
  const [pendingVideo, setPendingVideo] = useState(null);
  const [pendingDate, setPendingDate] = useState("");
  const [pendingTime, setPendingTime] = useState("");
  const [savingContent, setSavingContent] = useState(false);

  const [resetting, setResetting] = useState(false);

  const loadChannel = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/scheduled-live-tv/channel");
      const loaded = data?.data?.channel || null;
      setChannel(loaded);
      setCategories(data?.data?.categories || []);
      setListLimit(data?.data?.listLimit || 10);

      if (loaded) {
        setName(loaded.name);
        setHomeFeatured(Boolean(loaded.homeFeatured));
        setSelectedCategories(loaded.categories || []);
        setShowOnList(Boolean(loaded.showOnList));
        setPinned(Boolean(loaded.pinned));
        setAllTimeVideos(
          (loaded.allTimeVideos || []).map((entry, index) => ({
            key: `${entry.video?.fileName || index}`,
            video: entry.video,
            durationSeconds: entry.durationSeconds,
          })),
        );
        setSchedule(
          (loaded.schedule || []).map((entry, index) => ({
            key: `${entry.video?.fileName || index}-${entry.startTime}-${entry.date || "daily"}`,
            video: entry.video,
            date: entry.date || "",
            startTime: entry.startTime,
            durationSeconds: entry.durationSeconds,
          })),
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load the Pipra-TV channel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = () => {
      loadChannel();
    };

    init();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Logo must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const saveIdentity = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Channel name is required");
      return;
    }
    if (!channel && !logoFile) {
      toast.error("A logo image is required");
      return;
    }

    try {
      setSavingIdentity(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("homeFeatured", String(homeFeatured));
      formData.append("categories", JSON.stringify(selectedCategories));
      formData.append("showOnList", String(showOnList));
      formData.append("pinned", String(pinned));
      if (logoFile) formData.append("logo", logoFile);

      const { data } = await api.put("/api/admin/scheduled-live-tv/channel", formData);
      setChannel(data?.data?.channel || null);
      setLogoFile(null);
      setLogoPreview(null);
      toast.success("Pipra-TV identity saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save Pipra-TV identity");
    } finally {
      setSavingIdentity(false);
    }
  };

  const addAllTimeVideo = () => {
    if (!pendingAllTimeVideo?.url) {
      toast.error("Upload a video to add it to the pool");
      return;
    }

    setAllTimeVideos((prev) => [
      ...prev,
      {
        key: `${pendingAllTimeVideo.fileName}-${Date.now()}`,
        video: pendingAllTimeVideo,
        durationSeconds: pendingAllTimeVideo.durationSeconds,
      },
    ]);
    setPendingAllTimeVideo(null);
  };

  const removeAllTimeVideo = (key) => {
    setAllTimeVideos((prev) => prev.filter((entry) => entry.key !== key));
  };

  const addScheduleEntry = () => {
    if (!pendingVideo?.url) {
      toast.error("Upload a video for this schedule entry");
      return;
    }
    if (!pendingTime) {
      toast.error("Set a time for this schedule entry");
      return;
    }

    setSchedule((prev) => [
      ...prev,
      {
        key: `${pendingVideo.fileName}-${pendingTime}-${pendingDate || "daily"}-${Date.now()}`,
        video: pendingVideo,
        date: pendingDate || "",
        startTime: pendingTime,
        durationSeconds: pendingVideo.durationSeconds,
      },
    ]);

    setPendingVideo(null);
    setPendingDate("");
    setPendingTime("");
  };

  const removeScheduleEntry = (key) => {
    setSchedule((prev) => prev.filter((entry) => entry.key !== key));
  };

  const saveContent = async (e) => {
    e.preventDefault();

    try {
      setSavingContent(true);

      const formData = new FormData();
      formData.append(
        "allTimeVideos",
        JSON.stringify(
          allTimeVideos.map((entry) => ({
            video: {
              url: entry.video.url,
              fileName: entry.video.fileName,
              originalName: entry.video.originalName || null,
            },
            durationSeconds: entry.durationSeconds,
          })),
        ),
      );
      formData.append(
        "schedule",
        JSON.stringify(
          schedule.map((entry) => ({
            video: {
              url: entry.video.url,
              fileName: entry.video.fileName,
              originalName: entry.video.originalName || null,
            },
            startTime: entry.startTime,
            date: entry.date || null,
            durationSeconds: entry.durationSeconds,
          })),
        ),
      );

      const { data } = await api.put("/api/admin/scheduled-live-tv/channel", formData);
      setChannel(data?.data?.channel || null);
      toast.success("Pipra-TV content saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save Pipra-TV content");
    } finally {
      setSavingContent(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Reset the Pipra-TV channel? This deletes its identity, all-time pool, and schedule entirely.",
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      await api.delete("/api/admin/scheduled-live-tv/channel");
      setChannel(null);
      setName("Pipra-TV");
      setHomeFeatured(false);
      setLogoFile(null);
      setLogoPreview(null);
      setAllTimeVideos([]);
      setSchedule([]);
      toast.success("Pipra-TV channel reset");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset the Pipra-TV channel");
    } finally {
      setResetting(false);
    }
  };

  const base = api.defaults.baseURL;
  const sortedSchedule = [...schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) {
    return <div className="mt-8 py-10 text-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Panel 1 — Identity */}
      <form
        onSubmit={saveIdentity}
        className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        <h2 className="mb-1 text-xl font-black text-white">Pipra-TV Identity</h2>
        <p className="mb-5 text-sm text-slate-400">
          {channel
            ? "The site's own broadcast channel — name and logo shown to viewers."
            : "Set up Pipra-TV's name and logo first, then add its content below."}
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-base font-bold text-slate-100">
              Channel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pipra-TV"
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3.5 text-base text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-bold text-slate-100">Logo</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#8b5cf6]/25 bg-black/30">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                ) : channel?.logo ? (
                  <img
                    src={`${base}${channel.logo}`}
                    alt="Current logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageUp className="h-6 w-6 text-slate-500" />
                )}
              </div>

              <input
                type="file"
                id="otv-logo-input"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleLogoChange}
                className="hidden"
              />
              <label
                htmlFor="otv-logo-input"
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
              >
                <ImageUp className="h-4 w-4" />
                Choose Logo
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Live TV Categories{" "}
            {selectedCategories.length > 0 && (
              <span className="text-violet-300">
                ({selectedCategories.length} selected)
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-[#8b5cf6]/20 bg-black/35 p-3">
            {categories.map((entry) => {
              const active = selectedCategories.includes(entry.key);

              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() =>
                    setSelectedCategories((previous) =>
                      previous.includes(entry.key)
                        ? previous.filter((item) => item !== entry.key)
                        : [...previous, entry.key],
                    )
                  }
                  className={`cursor-pointer rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                    active
                      ? "border-[#8b5cf6] bg-[#8b5cf6] text-white"
                      : "border-[#8b5cf6]/25 bg-black/30 text-slate-300 hover:border-[#8b5cf6]/60 hover:text-white"
                  }`}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>

          <p className="mt-1.5 text-xs text-slate-400">
            Which sections Pipra-TV appears under on the client's Live TV page.
            Leave all off to keep it in the pinned row only — Pipra-TV is never
            listed under "Other Channels".
          </p>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3.5">
          <input
            type="checkbox"
            checked={showOnList}
            onChange={(e) => setShowOnList(e.target.checked)}
            className="mt-0.5 h-5 w-5 cursor-pointer accent-[#8b5cf6]"
          />
          <span className="text-base text-slate-200">
            Show on list
            <span className="mt-0.5 block text-xs text-slate-400">
              Shows Pipra-TV directly in each selected category's row on the
              Live TV page (max {listLimit} channels per category).
            </span>
          </span>
        </label>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3.5">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="mt-0.5 h-5 w-5 cursor-pointer accent-[#8b5cf6]"
          />
          <span className="text-base text-slate-200">
            Pin to the top of Live TV
            <span className="mt-0.5 block text-xs text-slate-400">
              Puts Pipra-TV first in the "Pinned Channels" slider directly under
              the player, above every category.
            </span>
          </span>
        </label>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3.5">
          <input
            type="checkbox"
            checked={homeFeatured}
            onChange={(e) => setHomeFeatured(e.target.checked)}
            className="h-5 w-5 cursor-pointer accent-[#8b5cf6]"
          />
          <span className="text-base text-slate-200">Show on the home page</span>
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savingIdentity}
            className="flex cursor-pointer items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-6 py-3.5 text-base font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {savingIdentity ? "Saving..." : channel ? "Update Identity" : "Create Pipra-TV Channel"}
          </button>

          {channel && (
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="ml-auto flex cursor-pointer items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {resetting ? "Resetting..." : "Reset Pipra-TV Channel"}
            </button>
          )}
        </div>
      </form>

      {/* Panel 2 — Content (only once the channel exists) */}
      {channel && (
        <form
          onSubmit={saveContent}
          className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
        >
          <h2 className="mb-1 text-xl font-black text-white">Pipra-TV Content</h2>
          <p className="mb-5 text-sm text-slate-400">
            Upload the videos Pipra-TV plays and program its broadcast timetable.
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-base font-bold text-slate-100">
                <Repeat className="h-5 w-5 text-[#8b5cf6]" />
                All Time Videos
              </label>
              <p className="mb-3 text-sm text-slate-400">
                Plays back-to-back on an endless loop whenever nothing below
                is scheduled for right now. Add as many as you like.
              </p>

              {allTimeVideos.length > 0 && (
                <div className="mb-4 max-h-[640px] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
                  {allTimeVideos.map((entry) => (
                    <div
                      key={entry.key}
                      className="space-y-2 rounded-xl border border-[#8b5cf6]/15 bg-black/25 p-3"
                    >
                      <video
                        src={entry.video.url}
                        controls
                        muted
                        className="aspect-video w-full rounded-lg bg-black object-contain"
                      />
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">
                            {entry.video.originalName || "Uploaded video"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDuration(entry.durationSeconds)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAllTimeVideo(entry.key)}
                          className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2.5 text-rose-300 transition hover:bg-rose-500/25"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 rounded-xl border border-dashed border-[#8b5cf6]/25 bg-black/15 p-4">
                <VideoUploadSlot
                  video={pendingAllTimeVideo}
                  onChange={setPendingAllTimeVideo}
                  label="pool video"
                  prompt="Choose a Video to Add to Rotation"
                  hint="Plays on repeat whenever nothing is scheduled"
                />
                <button
                  type="button"
                  onClick={addAllTimeVideo}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3.5 text-sm font-black text-violet-200 transition hover:bg-[#8b5cf6]/20"
                >
                  <Plus className="h-5 w-5" />
                  Add Video to All-Time Rotation
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-base font-bold text-slate-100">
                <CalendarClock className="h-5 w-5 text-[#8b5cf6]" />
                Programming Schedule
              </label>
              <p className="mb-3 text-sm text-slate-400">
                Leave the date empty to repeat this video every day at that
                time. Set a date for a one-time program on that day only —
                it overrides both the daily schedule and the all-time pool
                while active.
              </p>

              {sortedSchedule.length > 0 && (
                <div className="mb-4 max-h-[640px] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
                  {sortedSchedule.map((entry) => (
                    <div
                      key={entry.key}
                      className="space-y-2 rounded-xl border border-[#8b5cf6]/15 bg-black/25 p-3"
                    >
                      <video
                        src={entry.video.url}
                        controls
                        muted
                        className="aspect-video w-full rounded-lg bg-black object-contain"
                      />
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">
                            {entry.video.originalName || "Uploaded video"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {entry.date ? entry.date : "Every day"} at {entry.startTime} ·{" "}
                            {formatDuration(entry.durationSeconds)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScheduleEntry(entry.key)}
                          className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2.5 text-rose-300 transition hover:bg-rose-500/25"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 rounded-xl border border-dashed border-[#8b5cf6]/25 bg-black/15 p-4">
                <VideoUploadSlot
                  video={pendingVideo}
                  onChange={setPendingVideo}
                  label="schedule video"
                  prompt="Choose a Video for This Program"
                  hint="Plays automatically at the date/time you set below"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-300">
                      Date (optional — empty = daily)
                    </label>
                    <input
                      type="date"
                      value={pendingDate}
                      onChange={(e) => setPendingDate(e.target.value)}
                      className="w-full rounded-xl border border-[#8b5cf6]/20 bg-black/35 px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-300">
                      Time
                    </label>
                    <input
                      type="time"
                      value={pendingTime}
                      onChange={(e) => setPendingTime(e.target.value)}
                      className="w-full rounded-xl border border-[#8b5cf6]/20 bg-black/35 px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addScheduleEntry}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3.5 text-sm font-black text-violet-200 transition hover:bg-[#8b5cf6]/20"
                >
                  <Plus className="h-5 w-5" />
                  Add Program to Schedule
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingContent}
              className="flex cursor-pointer items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-6 py-3.5 text-base font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingContent ? "Saving..." : "Save Content"}
            </button>
          </div>
        </form>
      )}

      {channel?.homeFeatured && (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <HomeIcon className="h-3.5 w-3.5" />
          Pipra-TV is shown on the home page's Live TV row.
        </p>
      )}
    </div>
  );
};

export default OTvManager;
