import React, { useEffect, useRef, useState } from "react";
import {
  ImageUp,
  UploadCloud,
  Film,
  Clapperboard,
  Info,
  Save,
  Search,
  X,
  Megaphone,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-toastify";

import { api } from "../../api/axios";
import {
  MATURITY_RATING_OPTIONS,
  CATEGORY_OPTIONS,
  PROMOTABLE_SECTIONS,
} from "../../constants/videoOptions";

// Same MP4-Infinity-duration workaround used in studio's VideoForm.
const probeVideoDuration = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";

    const finish = (result, isError) => {
      clearTimeout(timeoutId);
      probe.removeAttribute("src");
      probe.load();
      URL.revokeObjectURL(url);
      if (isError) reject(result);
      else resolve(result);
    };

    const timeoutId = setTimeout(() => finish(probe.duration, false), 6000);

    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration)) {
        finish(probe.duration, false);
        return;
      }

      probe.currentTime = Number.MAX_SAFE_INTEGER;
      probe.ontimeupdate = () => {
        probe.ontimeupdate = null;
        finish(probe.duration, false);
      };
    };

    probe.onerror = () => finish(new Error("Could not read video metadata"), true);

    probe.src = url;
  });

const MAX_THUMBNAIL_SIZE = 20 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/3gpp",
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const FileSlot = ({ label, guidance, icon, accept, fileName, onChange, inputRef }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-200">{label}</label>

    <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
      <span>{guidance}</span>
    </div>

    <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />

    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
    >
      {icon}
      {fileName ? "Change File" : "Choose File"}
    </button>

    {fileName && (
      <p className="mt-2 truncate text-xs text-slate-400">Selected: {fileName}</p>
    )}
  </div>
);

const AdminVideoForm = ({ submitting = false, progress = 0, onSubmit }) => {
  const landscapeInputRef = useRef(null);
  const portraitInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const trailerInputRef = useRef(null);

  const [channelSearch, setChannelSearch] = useState("");
  const [channelResults, setChannelResults] = useState([]);
  const [searchingChannel, setSearchingChannel] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [maturityRating, setMaturityRating] = useState("");
  const [category, setCategory] = useState("");

  const [landscapeFile, setLandscapeFile] = useState(null);
  const [landscapePreview, setLandscapePreview] = useState(null);
  const [portraitFile, setPortraitFile] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [trailerPreview, setTrailerPreview] = useState(null);
  const [wantsTrailer, setWantsTrailer] = useState(false);

  const [wantsPromotion, setWantsPromotion] = useState(false);
  const [sections, setSections] = useState([]);
  const [scheduleType, setScheduleType] = useState("campaign");
  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedChannel || !channelSearch.trim()) {
      setChannelResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingChannel(true);
        const { data } = await api.get("/api/admin/users", {
          params: { search: channelSearch.trim(), limit: 8 },
        });
        setChannelResults(data?.data?.users || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Channel search failed");
      } finally {
        setSearchingChannel(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [channelSearch, selectedChannel]);

  const handleLandscapeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Thumbnail must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      setError("Thumbnail must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setError("");
    setLandscapeFile(file);
    setLandscapePreview(URL.createObjectURL(file));
  };

  const handlePortraitChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Thumbnail must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      setError("Thumbnail must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setError("");
    setPortraitFile(file);
    setPortraitPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VIDEO_TYPES.includes(file.type)) {
      setError("Video files must be MP4, WEBM, MOV, MKV, or AVI");
      e.target.value = "";
      return;
    }

    setError("");
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleTrailerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VIDEO_TYPES.includes(file.type)) {
      setError("Trailer must be MP4, WEBM, MOV, MKV, or AVI");
      e.target.value = "";
      return;
    }

    try {
      const dur = await probeVideoDuration(file);

      if (!Number.isFinite(dur) || dur < 1 || dur > 240) {
        setError(
          `Trailer must be between 1 second and 4 minutes long (yours is ${Math.round(dur)}s)`,
        );
        e.target.value = "";
        return;
      }

      setError("");
      setTrailerFile(file);
      setTrailerPreview(URL.createObjectURL(file));
    } catch {
      setError("Could not read the trailer file — try a different file");
      e.target.value = "";
    }
  };

  const handleTrailerWantChange = (wants) => {
    setWantsTrailer(wants);

    if (!wants) {
      setTrailerFile(null);
      setTrailerPreview(null);
      if (trailerInputRef.current) trailerInputRef.current.value = "";
    }
  };

  const toggleSection = (key) => {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedChannel) {
      setError("Select a channel first");
      return;
    }

    if (!title.trim() || !duration.trim() || !maturityRating || !category) {
      setError("Title, duration, maturity rating, and category are required");
      return;
    }

    if (!landscapeFile || !portraitFile) {
      setError("Both the landscape and portrait thumbnail images are required");
      return;
    }

    if (!videoFile) {
      setError("The full video file is required");
      return;
    }

    if (wantsTrailer && !trailerFile) {
      setError('Choose a trailer file, or switch trailer to "No"');
      return;
    }

    if (wantsPromotion && sections.length === 0) {
      setError("Select at least one section to promote in, or switch promotion off");
      return;
    }

    if (wantsPromotion && scheduleType === "campaign" && !endDate) {
      setError("Choose an end date for the campaign schedule");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("studioUserId", selectedChannel.id || selectedChannel._id);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("duration", duration.trim());
    formData.append("maturityRating", maturityRating);
    formData.append("category", category);
    formData.append("thumbnailLandscape", landscapeFile);
    formData.append("thumbnailPortrait", portraitFile);
    formData.append("video", videoFile);
    if (trailerFile) formData.append("trailer", trailerFile);

    if (wantsPromotion) {
      formData.append("sections", JSON.stringify(sections));
      formData.append("scheduleType", scheduleType);
      if (scheduleType === "campaign") {
        formData.append("endDate", new Date(endDate).toISOString());
      }
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
    >
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          1. Select Channel
        </label>

        {selectedChannel ? (
          <div className="flex items-center gap-4 rounded-2xl border border-[#8b5cf6]/25 bg-black/30 p-3">
            {selectedChannel.channel?.logo ? (
              <img
                src={`${api.defaults.baseURL}${selectedChannel.channel.logo}`}
                alt={selectedChannel.channel?.name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/15 text-lg font-black text-violet-300">
                {(selectedChannel.channel?.name || selectedChannel.fullName || "?")[0]}
              </div>
            )}

            <div className="flex-1">
              <p className="truncate text-sm font-bold text-white">
                {selectedChannel.channel?.name || "No channel name"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {selectedChannel.fullName} · {selectedChannel.email}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedChannel(null)}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
              Change
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b5cf6]" />
              <input
                type="text"
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                placeholder="Search by channel name, email, or phone..."
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            {searchingChannel && <p className="mt-2 text-xs text-slate-400">Searching...</p>}

            {!searchingChannel && channelSearch.trim() && channelResults.length === 0 && (
              <p className="mt-2 text-xs text-slate-400">No matching studio users found.</p>
            )}

            {channelResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {channelResults.map((user) => (
                  <button
                    key={user._id || user.id}
                    type="button"
                    onClick={() => {
                      setSelectedChannel(user);
                      setChannelResults([]);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/25 p-2.5 text-left transition hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10"
                  >
                    {user.channel?.logo ? (
                      <img
                        src={`${api.defaults.baseURL}${user.channel.logo}`}
                        alt={user.channel?.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/15 text-sm font-black text-violet-300">
                        {(user.channel?.name || user.fullName || "?")[0]}
                      </div>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white">
                        {user.channel?.name || user.fullName}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {user.email} · {user.phone}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Video Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Last Sunrise"
          className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Short Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="A brief summary of what viewers can expect..."
          className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Runtime / Duration
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 2h 15m"
            className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Maturity Rating
          </label>
          <select
            value={maturityRating}
            onChange={(e) => setMaturityRating(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
          >
            <option value="" className="bg-[#0e0a1a]">
              Select rating
            </option>
            {MATURITY_RATING_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-[#0e0a1a]">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
          >
            <option value="" className="bg-[#0e0a1a]">
              Select category
            </option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-[#0e0a1a]">
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <FileSlot
            label="Thumbnail — Landscape (Desktop/Laptop)"
            icon={<ImageUp className="h-4 w-4" />}
            accept="image/png,image/jpeg,image/webp,image/gif"
            guidance={
              <>
                Recommended <span className="font-bold text-white">1280×720px</span>{" "}
                (16:9). Max file size: <span className="font-bold text-white">20MB</span>.
              </>
            }
            fileName={landscapeFile?.name}
            onChange={handleLandscapeChange}
            inputRef={landscapeInputRef}
          />

          {landscapePreview && (
            <div className="mt-3 w-full max-w-md overflow-hidden rounded-2xl border border-[#8b5cf6]/20">
              <img
                src={landscapePreview}
                alt="Landscape thumbnail preview"
                className="aspect-video w-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <FileSlot
            label="Thumbnail — Portrait (Mobile)"
            icon={<ImageUp className="h-4 w-4" />}
            accept="image/png,image/jpeg,image/webp,image/gif"
            guidance={
              <>
                Recommended <span className="font-bold text-white">720×1280px</span>{" "}
                (9:16). Max file size: <span className="font-bold text-white">20MB</span>.
              </>
            }
            fileName={portraitFile?.name}
            onChange={handlePortraitChange}
            inputRef={portraitInputRef}
          />

          {portraitPreview && (
            <div className="mt-3 w-full max-w-55 overflow-hidden rounded-2xl border border-[#8b5cf6]/20">
              <img
                src={portraitPreview}
                alt="Portrait thumbnail preview"
                className="aspect-[9/16] w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <FileSlot
          label="Full Video"
          icon={<UploadCloud className="h-4 w-4" />}
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
          guidance={
            <>
              Supported formats:{" "}
              <span className="font-bold text-white">MP4, WEBM, MOV, MKV, AVI</span>.
              Max file size: <span className="font-bold text-white">up to 2GB</span>.
            </>
          }
          fileName={videoFile?.name}
          onChange={handleVideoChange}
          inputRef={videoInputRef}
        />

        {videoPreview && (
          <video
            src={videoPreview}
            controls
            className="mt-3 w-full max-w-md rounded-2xl border border-[#8b5cf6]/20 bg-black"
          />
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Trailer (Optional)
        </label>

        <p className="mb-3 text-xs leading-relaxed text-slate-400">
          A short preview clip (up to 4 minutes). Do you want to add one?
        </p>

        <div className="mb-4 flex gap-3">
          <button
            type="button"
            onClick={() => handleTrailerWantChange(true)}
            className={`flex-1 cursor-pointer rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
              wantsTrailer
                ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                : "border-[#8b5cf6]/20 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
            }`}
          >
            Yes, add a trailer
          </button>

          <button
            type="button"
            onClick={() => handleTrailerWantChange(false)}
            className={`flex-1 cursor-pointer rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
              !wantsTrailer
                ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                : "border-[#8b5cf6]/20 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
            }`}
          >
            No trailer
          </button>
        </div>

        {wantsTrailer && (
          <>
            <FileSlot
              label="Trailer File"
              icon={<Clapperboard className="h-4 w-4" />}
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
              guidance={
                <>
                  Must be <span className="font-bold text-white">4 minutes or shorter</span>.
                </>
              }
              fileName={trailerFile?.name}
              onChange={handleTrailerChange}
              inputRef={trailerInputRef}
            />

            {trailerPreview && (
              <video
                src={trailerPreview}
                controls
                className="mt-3 w-full max-w-md rounded-2xl border border-[#8b5cf6]/20 bg-black"
              />
            )}
          </>
        )}
      </div>

      <div className="rounded-2xl border border-[#8b5cf6]/20 bg-black/20 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[#8b5cf6]" />
          <label className="text-sm font-semibold text-slate-200">
            Promote this video on the home page? (optional)
          </label>
        </div>

        <div className="mb-4 flex gap-3">
          <button
            type="button"
            onClick={() => setWantsPromotion(true)}
            className={`flex-1 cursor-pointer rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
              wantsPromotion
                ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                : "border-[#8b5cf6]/20 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
            }`}
          >
            Yes, promote it
          </button>

          <button
            type="button"
            onClick={() => setWantsPromotion(false)}
            className={`flex-1 cursor-pointer rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
              !wantsPromotion
                ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                : "border-[#8b5cf6]/20 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
            }`}
          >
            Not now
          </button>
        </div>

        {wantsPromotion && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PROMOTABLE_SECTIONS.map((section) => (
                <label
                  key={section.key}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                    sections.includes(section.key)
                      ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                      : "border-[#8b5cf6]/15 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sections.includes(section.key)}
                    onChange={() => toggleSection(section.key)}
                    className="hidden"
                  />
                  {section.label}
                </label>
              ))}
            </div>

            <div className="mb-4 flex gap-3">
              <button
                type="button"
                onClick={() => setScheduleType("campaign")}
                className={`flex-1 cursor-pointer rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
                  scheduleType === "campaign"
                    ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                    : "border-[#8b5cf6]/20 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
                }`}
              >
                Campaign (date range)
              </button>

              <button
                type="button"
                onClick={() => setScheduleType("lifetime")}
                className={`flex-1 cursor-pointer rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
                  scheduleType === "lifetime"
                    ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                    : "border-[#8b5cf6]/20 bg-black/25 text-slate-400 hover:bg-[#8b5cf6]/10"
                }`}
              >
                Lifetime (no end date)
              </button>
            </div>

            {scheduleType === "campaign" && (
              <div className="relative max-w-xs">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b5cf6]" />
                <input
                  type="date"
                  value={endDate}
                  min={todayISO()}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                />
              </div>
            )}
          </>
        )}
      </div>

      {submitting && (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-[#8b5cf6]" />
              Uploading...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_50px_rgba(139,92,246,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-5 w-5" />
        {submitting ? "Uploading..." : "Publish Video"}
      </button>
    </form>
  );
};

export default AdminVideoForm;
