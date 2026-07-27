import React, { useRef, useState } from "react";
import {
  ImageUp,
  UploadCloud,
  Film,
  Clapperboard,
  Info,
  Save,
} from "lucide-react";

import {
  MATURITY_RATING_OPTIONS,
  CATEGORY_OPTIONS,
} from "../../constants/videoOptions";

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

const FileSlot = ({
  label,
  guidance,
  icon,
  accept,
  currentLabel,
  fileName,
  onChange,
  inputRef,
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-200">
      {label}
    </label>

    <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#f59e0b]/15 bg-[#f59e0b]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#f59e0b]" />
      <span>{guidance}</span>
    </div>

    <input
      ref={inputRef}
      type="file"
      accept={accept}
      onChange={onChange}
      className="hidden"
    />

    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-5 py-3 text-sm font-bold text-amber-200 transition hover:bg-[#f59e0b]/20"
    >
      {icon}
      {fileName ? "Change File" : currentLabel ? "Replace File" : "Choose File"}
    </button>

    {fileName && (
      <p className="mt-2 truncate text-xs text-slate-400">
        Selected: {fileName}
      </p>
    )}

    {!fileName && currentLabel && (
      <p className="mt-2 truncate text-xs text-slate-400">
        Current: {currentLabel}
      </p>
    )}
  </div>
);

const VideoForm = ({
  mode = "create",
  initialValues = {},
  submitting = false,
  progress = 0,
  onSubmit,
}) => {
  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const trailerInputRef = useRef(null);

  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [duration, setDuration] = useState(initialValues.duration || "");
  const [maturityRating, setMaturityRating] = useState(
    initialValues.maturityRating || "",
  );
  const [category, setCategory] = useState(initialValues.category || "");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialValues.thumbnailPreview || null,
  );
  const [videoFile, setVideoFile] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);

  const [error, setError] = useState("");

  const handleThumbnailChange = (e) => {
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
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
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
  };

  const handleTrailerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VIDEO_TYPES.includes(file.type)) {
      setError("Trailer must be MP4, WEBM, MOV, MKV, or AVI");
      e.target.value = "";
      return;
    }

    setError("");
    setTrailerFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !duration.trim() || !maturityRating || !category) {
      setError("Title, duration, maturity rating, and category are required");
      return;
    }

    if (mode === "create" && !thumbnailFile) {
      setError("A thumbnail image is required");
      return;
    }

    if (mode === "create" && !videoFile) {
      setError("The full video file is required");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("duration", duration.trim());
    formData.append("maturityRating", maturityRating);
    formData.append("category", category);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
    if (videoFile) formData.append("video", videoFile);
    if (trailerFile) formData.append("trailer", trailerFile);

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
    >
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Video Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Last Sunrise"
          className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
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
          className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
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
            className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Maturity Rating
          </label>
          <select
            value={maturityRating}
            onChange={(e) => setMaturityRating(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
          >
            <option value="" className="bg-[#1a1206]">
              Select rating
            </option>
            {MATURITY_RATING_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-[#1a1206]">
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
            className="w-full cursor-pointer rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
          >
            <option value="" className="bg-[#1a1206]">
              Select category
            </option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-[#1a1206]">
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FileSlot
        label="Thumbnail Image"
        icon={<ImageUp className="h-4 w-4" />}
        accept="image/png,image/jpeg,image/webp,image/gif"
        guidance={
          <>
            Recommended size:{" "}
            <span className="font-bold text-white">1280×720px</span> (16:9
            landscape). Max file size:{" "}
            <span className="font-bold text-white">20MB</span>. Supported
            formats:{" "}
            <span className="font-bold text-white">
              PNG, JPG, JPEG, WEBP, GIF
            </span>
            .
          </>
        }
        currentLabel={initialValues.thumbnailPreview ? "existing thumbnail" : null}
        fileName={thumbnailFile?.name}
        onChange={handleThumbnailChange}
        inputRef={thumbnailInputRef}
      />

      {thumbnailPreview && (
        <div className="overflow-hidden rounded-2xl border border-[#f59e0b]/20">
          <img
            src={thumbnailPreview}
            alt="Thumbnail preview"
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      <FileSlot
        label="Full Video"
        icon={<UploadCloud className="h-4 w-4" />}
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
        guidance={
          <>
            Supported formats:{" "}
            <span className="font-bold text-white">
              MP4, WEBM, MOV, MKV, AVI
            </span>
            . Max file size:{" "}
            <span className="font-bold text-white">up to 2GB</span>. Larger
            files may take longer to upload — keep this tab open until it
            finishes.
          </>
        }
        currentLabel={initialValues.videoFileLabel}
        fileName={videoFile?.name}
        onChange={handleVideoChange}
        inputRef={videoInputRef}
      />

      <FileSlot
        label="Trailer (Optional)"
        icon={<Clapperboard className="h-4 w-4" />}
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
        guidance={
          <>
            A short preview clip viewers can watch before the full video.
            Same supported formats as the full video. Leave this empty if you
            don't have one.
          </>
        }
        currentLabel={initialValues.trailerFileLabel}
        fileName={trailerFile?.name}
        onChange={handleTrailerChange}
        inputRef={trailerInputRef}
      />

      {submitting && (
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-[#f59e0b]" />
              Uploading...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] px-5 py-3.5 text-sm font-black text-black shadow-[0_18px_50px_rgba(245,158,11,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-5 w-5" />
        {submitting
          ? "Uploading..."
          : mode === "create"
            ? "Submit for Review"
            : "Save Changes"}
      </button>
    </form>
  );
};

export default VideoForm;
