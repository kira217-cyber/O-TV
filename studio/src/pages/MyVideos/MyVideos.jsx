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
  Search,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
} from "lucide-react";

import { api } from "../../api/axios";

const PAGE_SIZE = 30;

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadVideos = async (query, pageNumber) => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/studio/videos", {
        params: {
          search: query || undefined,
          page: pageNumber,
          limit: PAGE_SIZE,
        },
      });

      const payload = data?.data || data;

      setVideos(payload?.videos || []);
      setTotalPages(payload?.totalPages || 1);
      setTotal(payload?.total || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos("", 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadVideos(search, 1);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    loadVideos(search, nextPage);
  };

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
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent">
            My Videos
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track the status of everything you've uploaded to Pipra-TV.
            {total > 0 && (
              <span className="ml-1 text-slate-500">({total} total)</span>
            )}
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

      <div className="mb-6 relative w-full sm:max-w-md">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#f59e0b]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your videos by title..."
          className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
        />
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
          Loading videos...
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <Film className="h-10 w-10 text-[#f59e0b]/60" />
          <p>{search ? "No videos match your search." : "You haven't uploaded any videos yet."}</p>
          {!search && (
            <Link
              to="/upload-video"
              className="mt-2 cursor-pointer text-sm font-bold text-amber-300 hover:underline"
            >
              Upload your first video
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => {
            const meta = STATUS_META[video.status] || STATUS_META.pending;
            const StatusIcon = meta.icon;
            const base = api.defaults.baseURL;

            return (
              <div
                key={video.id}
                className="flex flex-col gap-2 overflow-hidden rounded-[20px] border border-[#f59e0b]/15 bg-black/30 shadow-xl shadow-black/30 transition hover:border-[#f59e0b]/40"
              >
                <Link
                  to={`/watch/${video.id}`}
                  className="group relative block w-full cursor-pointer overflow-hidden bg-black/50"
                >
                  {/* Portrait (2:3) on mobile, landscape (16:9) on desktop/laptop */}
                  <img
                    src={`${base}${video.thumbnail?.portrait}`}
                    alt={video.title}
                    className="aspect-[2/3] w-full object-cover transition group-hover:scale-105 md:hidden"
                  />
                  <img
                    src={`${base}${video.thumbnail?.landscape}`}
                    alt={video.title}
                    className="hidden aspect-video w-full object-cover transition group-hover:scale-105 md:block"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                  <span
                    className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${meta.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {meta.label}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
                  <Link to={`/watch/${video.id}`} className="cursor-pointer">
                    <p className="truncate text-base font-black text-white hover:text-amber-200">
                      {video.title}
                    </p>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#f59e0b]" />
                      {video.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-[#f59e0b]" />
                      {video.maturityRating}
                    </span>
                  </div>

                  {video.status === "rejected" && video.rejectionReason && (
                    <p className="truncate rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300">
                      {video.rejectionReason}
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-2 pt-1">
                    <Link
                      to={`/edit-video/${video.id}`}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#f59e0b]/15 px-2 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-[#f59e0b]/25"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(video)}
                      disabled={deletingId === video.id}
                      className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-rose-500/15 px-2.5 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-2.5 text-sm font-bold text-amber-200 transition hover:bg-[#f59e0b]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <span className="text-sm font-semibold text-slate-300">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-2.5 text-sm font-bold text-amber-200 transition hover:bg-[#f59e0b]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyVideos;
