import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import {
  Film,
  UploadCloud,
  Pencil,
  Trash2,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";

import { api } from "../../api/axios";

const STATUS_META = {
  pending: {
    label: "Pending Review",
    className: "bg-amber-500/15 text-amber-300",
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

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadVideos = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/studio/videos");
      setVideos(data?.data?.videos || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDelete = async (video) => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(video.id);
      await api.delete(`/api/studio/videos/${video.id}`);
      setVideos((prev) => prev.filter((item) => item.id !== video.id));
      toast.success("Video deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl text-white">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent">
            My Videos
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track the status of everything you've uploaded to O-TV.
          </p>
        </div>

        <Link
          to="/upload-video"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] px-5 py-3 text-sm font-black text-black shadow-lg shadow-[#f59e0b]/30 transition hover:scale-[1.02]"
        >
          <UploadCloud className="h-4 w-4" />
          Upload New
        </Link>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
          Loading videos...
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <Film className="h-10 w-10 text-[#f59e0b]/60" />
          <p>You haven't uploaded any videos yet.</p>
          <Link
            to="/upload-video"
            className="mt-2 cursor-pointer text-sm font-bold text-amber-300 hover:underline"
          >
            Upload your first video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => {
            const meta = STATUS_META[video.status] || STATUS_META.pending;
            const StatusIcon = meta.icon;

            return (
              <div
                key={video.id}
                className="flex flex-col gap-3 overflow-hidden rounded-[24px] border border-[#f59e0b]/15 bg-black/30 shadow-xl shadow-black/30 transition hover:border-[#f59e0b]/40"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                  <img
                    src={`${api.defaults.baseURL}${video.thumbnail}`}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {meta.label}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
                  <p className="truncate text-base font-black text-white">
                    {video.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#f59e0b]" />
                      {video.duration}
                    </span>
                    <span className="rounded-full bg-[#f59e0b]/10 px-2 py-0.5 text-amber-300">
                      {video.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-[#f59e0b]" />
                      {video.maturityRating}
                    </span>
                  </div>

                  {video.status === "rejected" && video.rejectionReason && (
                    <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                      Reason: {video.rejectionReason}
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <Link
                      to={`/edit-video/${video.id}`}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#f59e0b]/15 px-3 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-[#f59e0b]/25"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(video)}
                      disabled={deletingId === video.id}
                      className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-500/15 px-3 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyVideos;
