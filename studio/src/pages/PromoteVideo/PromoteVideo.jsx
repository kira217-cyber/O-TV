import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Search,
  Megaphone,
  CalendarDays,
  Send,
  X,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";

import { api } from "../../api/axios";
import { PROMOTABLE_SECTIONS } from "../../constants/videoOptions";

const STATUS_META = {
  pending: {
    label: "Pending Review",
    className: "bg-amber-500/15 text-amber-300",
    icon: Hourglass,
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-400",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-500/15 text-rose-400",
    icon: XCircle,
  },
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const PromoteVideo = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [sections, setSections] = useState([]);
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const { data } = await api.get("/api/studio/promotions");
      setRequests(data?.data?.promotions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load promotion requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedVideo || !search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const { data } = await api.get("/api/studio/videos", {
          params: { search: search.trim(), status: "active", limit: 8 },
        });
        setResults(data?.data?.videos || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Search failed");
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search, selectedVideo]);

  const toggleSection = (key) => {
    setSections((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const resetForm = () => {
    setSelectedVideo(null);
    setSearch("");
    setResults([]);
    setSections([]);
    setEndDate("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVideo) {
      setError("Select a video first");
      return;
    }

    if (sections.length === 0) {
      setError("Select at least one section to promote in");
      return;
    }

    if (!endDate) {
      setError("Choose an end date for the campaign");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/api/studio/promotions", {
        videoId: selectedVideo.id,
        sections,
        endDate: new Date(endDate).toISOString(),
      });

      toast.success("Promotion request submitted and pending admin review");
      resetForm();
      loadRequests();
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to submit promotion request");
    } finally {
      setSubmitting(false);
    }
  };

  const base = api.defaults.baseURL;

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-4 py-3">
          <Megaphone className="h-5 w-5 text-[#f59e0b]" />
          <span className="text-sm font-bold text-amber-200">Get Featured</span>
        </div>

        <h1 className="mt-4 bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          Promotion Video
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          Ask admin to feature one of your approved videos on the O-TV home
          page for a limited time.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-10 max-w-3xl space-y-6 rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            1. Select a Video
          </label>

          {selectedVideo ? (
            <div className="flex items-center gap-4 rounded-2xl border border-[#f59e0b]/25 bg-black/30 p-3">
              <img
                src={`${base}${selectedVideo.thumbnail?.landscape}`}
                alt={selectedVideo.title}
                className="h-16 w-28 shrink-0 rounded-xl object-cover"
              />
              <p className="flex-1 truncate text-sm font-bold text-white">
                {selectedVideo.title}
              </p>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#f59e0b]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your approved videos by title..."
                  className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
                />
              </div>

              {searching && (
                <p className="mt-2 text-xs text-slate-400">Searching...</p>
              )}

              {!searching && search.trim() && results.length === 0 && (
                <p className="mt-2 text-xs text-slate-400">
                  No approved videos match "{search}".
                </p>
              )}

              {results.length > 0 && (
                <div className="mt-3 space-y-2">
                  {results.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => {
                        setSelectedVideo(video);
                        setResults([]);
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[#f59e0b]/15 bg-black/25 p-2.5 text-left transition hover:border-[#f59e0b]/50 hover:bg-[#f59e0b]/10"
                    >
                      <img
                        src={`${base}${video.thumbnail?.landscape}`}
                        alt={video.title}
                        className="h-12 w-20 shrink-0 rounded-lg object-cover"
                      />
                      <span className="truncate text-sm font-semibold text-white">
                        {video.title}
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
            2. Where do you want it featured?
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PROMOTABLE_SECTIONS.map((section) => (
              <label
                key={section.key}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                  sections.includes(section.key)
                    ? "border-[#f59e0b]/60 bg-[#f59e0b]/20 text-amber-200"
                    : "border-[#f59e0b]/15 bg-black/25 text-slate-400 hover:bg-[#f59e0b]/10"
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
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            3. Campaign — show until
          </label>

          <div className="relative max-w-xs">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#f59e0b]" />
            <input
              type="date"
              value={endDate}
              min={todayISO()}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] px-5 py-3.5 text-sm font-black text-black shadow-[0_18px_50px_rgba(245,158,11,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          <Send className="h-5 w-5" />
          {submitting ? "Submitting..." : "Submit Promotion Request"}
        </button>
      </form>

      <div className="rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <h2 className="mb-4 text-lg font-black text-white">
          My Promotion Requests
        </h2>

        {loadingRequests ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No promotion requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const meta = STATUS_META[request.status] || STATUS_META.pending;
              const StatusIcon = meta.icon;

              return (
                <div
                  key={request._id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#f59e0b]/15 bg-black/25 p-4 sm:flex-row sm:items-center"
                >
                  {request.video?.thumbnail?.landscape && (
                    <img
                      src={`${base}${request.video.thumbnail.landscape}`}
                      alt={request.video?.title}
                      className="h-14 w-24 shrink-0 rounded-xl object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {request.video?.title || "Video removed"}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                      {request.sections.map((key) => (
                        <span
                          key={key}
                          className="rounded-full bg-[#f59e0b]/10 px-2 py-0.5 text-amber-300"
                        >
                          {PROMOTABLE_SECTIONS.find((s) => s.key === key)?.label || key}
                        </span>
                      ))}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Until {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    {request.status === "rejected" && request.rejectionReason && (
                      <p className="mt-1 text-[11px] text-rose-300">
                        {request.rejectionReason}
                      </p>
                    )}
                  </div>

                  <span
                    className={`flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold ${meta.className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoteVideo;
