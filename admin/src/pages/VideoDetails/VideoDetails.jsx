import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Film,
  ImageUp,
  Info,
  Save,
  ShieldAlert,
  Trash2,
  UploadCloud,
  XCircle,
  Hourglass,
  Clapperboard,
} from "lucide-react";

import { api } from "../../api/axios";
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

const STATUS_META = {
  pending: {
    label: "Pending Review",
    className: "bg-amber-500/15 text-amber-400",
    icon: Hourglass,
  },
  active: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-400",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-500/15 text-rose-400",
    icon: XCircle,
  },
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const VideoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const trailerInputRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [maturityRating, setMaturityRating] = useState("");
  const [category, setCategory] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);

  const loadVideo = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/api/admin/videos/${id}`);
      const loaded = data?.data?.video || data?.video;

      setVideo(loaded);
      setTitle(loaded?.title || "");
      setDescription(loaded?.description || "");
      setDuration(loaded?.duration || "");
      setMaturityRating(loaded?.maturityRating || "");
      setCategory(loaded?.category || "");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load video");
      navigate("/videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const decide = async (status) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejecting this video");
      return;
    }

    try {
      setDeciding(true);

      const { data } = await api.patch(`/api/admin/videos/${id}/status`, {
        status,
        rejectionReason: status === "rejected" ? rejectionReason.trim() : undefined,
      });
      const updated = data?.data?.video || data?.video;

      setVideo((prev) => ({ ...prev, ...updated }));
      setShowRejectBox(false);
      setRejectionReason("");
      toast.success(
        status === "active" ? "Video approved and is now live" : "Video rejected",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setDeciding(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/api/admin/videos/${id}`);
      toast.success("Video deleted successfully");
      navigate("/videos");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete video");
      setDeleting(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Thumbnail must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      toast.error("Thumbnail must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error("Video files must be MP4, WEBM, MOV, MKV, or AVI");
      e.target.value = "";
      return;
    }

    setVideoFile(file);
  };

  const handleTrailerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error("Trailer must be MP4, WEBM, MOV, MKV, or AVI");
      e.target.value = "";
      return;
    }

    setTrailerFile(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("duration", duration.trim());
      formData.append("maturityRating", maturityRating);
      formData.append("category", category);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      if (videoFile) formData.append("video", videoFile);
      if (trailerFile) formData.append("trailer", trailerFile);

      const { data } = await api.put(`/api/admin/videos/${id}`, formData);
      const updated = data?.data?.video || data?.video;

      setVideo(updated);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setVideoFile(null);
      setTrailerFile(null);
      toast.success("Video updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update video");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Loading video...
      </div>
    );
  }

  if (!video) return null;

  const meta = STATUS_META[video.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-4xl">
        <NavLink
          to="/videos"
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-violet-200 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Video Approvals
        </NavLink>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-white md:text-3xl">
                {video.title}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.className}`}
              >
                <StatusIcon className="h-3 w-3" />
                {meta.label}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Uploaded by{" "}
              <span className="font-semibold text-violet-300">
                {video.studioUser?.fullName || "Unknown creator"}
              </span>
              {video.studioUser?.email && ` · ${video.studioUser.email}`}
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
              <CalendarDays className="h-4 w-4" />
              Uploaded {formatDate(video.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-rose-500/15 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete Video"}
          </button>
        </div>

        {video.status === "rejected" && video.rejectionReason && (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <span className="font-bold">Rejection reason: </span>
            {video.rejectionReason}
          </div>
        )}

        <div className="mb-6 overflow-hidden rounded-[28px] border border-[#8b5cf6]/20 bg-black/40 shadow-2xl shadow-black/40">
          <video
            controls
            poster={`${api.defaults.baseURL}${video.thumbnail}`}
            src={video.video?.url}
            className="aspect-video w-full bg-black"
          />
        </div>

        {video.trailer?.url && (
          <div className="mb-6">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-300">
              <Clapperboard className="h-4 w-4 text-[#8b5cf6]" />
              Trailer
            </p>
            <div className="overflow-hidden rounded-[28px] border border-[#8b5cf6]/20 bg-black/40 shadow-2xl shadow-black/40">
              <video
                controls
                src={video.trailer.url}
                className="aspect-video w-full bg-black"
              />
            </div>
          </div>
        )}

        {video.description && (
          <p className="mb-6 rounded-2xl border border-[#8b5cf6]/15 bg-white/[0.04] px-5 py-4 text-sm leading-relaxed text-slate-300">
            {video.description}
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-[#8b5cf6]/10 px-3 py-1.5 text-xs font-bold text-violet-300">
            <Clock className="h-3.5 w-3.5" />
            {video.duration}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#8b5cf6]/10 px-3 py-1.5 text-xs font-bold text-violet-300">
            <Film className="h-3.5 w-3.5" />
            {video.category}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#8b5cf6]/10 px-3 py-1.5 text-xs font-bold text-violet-300">
            <ShieldAlert className="h-3.5 w-3.5" />
            {video.maturityRating}
          </span>
        </div>

        {video.status === "pending" && (
          <div className="mb-6 space-y-4 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <h2 className="text-lg font-black text-white">Review Decision</h2>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => decide("active")}
                disabled={deciding}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Video
              </button>

              <button
                type="button"
                onClick={() => setShowRejectBox((prev) => !prev)}
                disabled={deciding}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-rose-500/15 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                Reject Video
              </button>
            </div>

            {showRejectBox && (
              <div className="space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this video is being rejected..."
                  className="w-full rounded-2xl border border-rose-500/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-rose-500/70 focus:ring-2 focus:ring-rose-500/20"
                />
                <button
                  type="button"
                  onClick={() => decide("rejected")}
                  disabled={deciding}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  {deciding ? "Submitting..." : "Confirm Rejection"}
                </button>
              </div>
            )}
          </div>
        )}

        {video.status === "active" && (
          <div className="mb-6 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <p className="mb-3 text-sm text-slate-300">
              This video is live. You can still reject it to pull it down.
            </p>
            <button
              type="button"
              onClick={() => setShowRejectBox((prev) => !prev)}
              disabled={deciding}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-rose-500/15 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Reject Video
            </button>

            {showRejectBox && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this video is being rejected..."
                  className="w-full rounded-2xl border border-rose-500/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-rose-500/70 focus:ring-2 focus:ring-rose-500/20"
                />
                <button
                  type="button"
                  onClick={() => decide("rejected")}
                  disabled={deciding}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  {deciding ? "Submitting..." : "Confirm Rejection"}
                </button>
              </div>
            )}
          </div>
        )}

        {video.status === "rejected" && (
          <div className="mb-6 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <p className="mb-3 text-sm text-slate-300">
              This video was rejected. You can approve it if the issue has
              been resolved.
            </p>
            <button
              type="button"
              onClick={() => decide("active")}
              disabled={deciding}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Video
            </button>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
        >
          <h2 className="text-lg font-black text-white">Edit Details</h2>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
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
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
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
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
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
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-[#0e0a1a]">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Thumbnail Image
            </label>

            <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
              <span>
                Recommended size:{" "}
                <span className="font-bold text-white">1280×720px</span>{" "}
                (16:9 landscape). Max file size:{" "}
                <span className="font-bold text-white">20MB</span>. Supported
                formats:{" "}
                <span className="font-bold text-white">
                  PNG, JPG, JPEG, WEBP, GIF
                </span>
                .
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#8b5cf6]/25 bg-black/30">
                <img
                  src={
                    thumbnailPreview || `${api.defaults.baseURL}${video.thumbnail}`
                  }
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
                >
                  <ImageUp className="h-4 w-4" />
                  Change Thumbnail
                </button>

                {thumbnailFile && (
                  <p className="mt-2 truncate text-xs text-slate-400">
                    Selected: {thumbnailFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Full Video
            </label>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
              onChange={handleVideoChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
            >
              <UploadCloud className="h-4 w-4" />
              Replace Video File
            </button>

            {videoFile && (
              <p className="mt-2 truncate text-xs text-slate-400">
                Selected: {videoFile.name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Trailer
            </label>

            <input
              ref={trailerInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
              onChange={handleTrailerChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => trailerInputRef.current?.click()}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
            >
              <Clapperboard className="h-4 w-4" />
              Replace Trailer
            </button>

            {trailerFile && (
              <p className="mt-2 truncate text-xs text-slate-400">
                Selected: {trailerFile.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_50px_rgba(139,92,246,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoDetails;
