import React, { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { toast } from "react-toastify";
import {
  Search,
  RefreshCw,
  Film,
  ChevronRight,
  ChevronLeft,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { api } from "../../api/axios";

const PAGE_SIZE = 30;

const TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "rejected", label: "Rejected" },
];

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

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadVideos = async (query, statusFilter, pageNumber) => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/videos", {
        params: {
          search: query || undefined,
          status: statusFilter || undefined,
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
    loadVideos("", "", 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadVideos(search, status, 1);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    loadVideos(search, status, nextPage);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-4 py-3">
            <Film className="h-5 w-5 text-[#8b5cf6]" />
            <span className="text-sm font-bold text-violet-200">
              Content Moderation
            </span>
          </div>

          <h1 className="mt-4 bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            Video Approvals
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Review videos uploaded by O-TV Studio creators.
            {total > 0 && (
              <span className="ml-1 text-slate-400">({total} total)</span>
            )}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b5cf6]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title..."
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            <button
              onClick={() => loadVideos(search, status, page)}
              disabled={loading}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatus(tab.key)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold transition ${
                  status === tab.key
                    ? "bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] text-white shadow-lg shadow-[#8b5cf6]/30"
                    : "bg-black/30 text-slate-300 hover:bg-[#8b5cf6]/15 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
            Loading videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
            No videos found.
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
                  className="flex flex-col gap-2 overflow-hidden rounded-[20px] border border-[#8b5cf6]/15 bg-black/30 shadow-xl shadow-black/30 transition hover:border-[#8b5cf6]/40"
                >
                  <div className="relative w-full overflow-hidden bg-black/50">
                    {/* Portrait (9:16) on mobile, landscape (16:9) on desktop/laptop */}
                    <img
                      src={`${base}${video.thumbnail?.portrait}`}
                      alt={video.title}
                      className="aspect-[9/16] h-full w-full object-cover md:hidden"
                    />
                    <img
                      src={`${base}${video.thumbnail?.landscape}`}
                      alt={video.title}
                      className="hidden aspect-video h-full w-full object-cover md:block"
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

                    <p className="truncate text-xs font-semibold text-violet-300">
                      by {video.studioUser?.fullName || "Unknown creator"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#8b5cf6]" />
                        {video.duration}
                      </span>
                      <span className="rounded-full bg-[#8b5cf6]/10 px-2.5 py-1 text-violet-300">
                        {video.category}
                      </span>
                    </div>

                    <NavLink
                      to={`/videos/${video.id}`}
                      className="mt-auto flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#8b5cf6]/15 px-3 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/25"
                    >
                      Review
                      <ChevronRight className="h-3.5 w-3.5" />
                    </NavLink>
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
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
