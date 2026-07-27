import React, { useEffect, useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Clock,
  Film,
  Pencil,
  ShieldAlert,
  Clapperboard,
  PlayCircle,
} from "lucide-react";

import { api } from "../../api/axios";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";

const STATUS_META = {
  pending: { label: "Pending Review", className: "bg-amber-500/15 text-amber-300" },
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-400" },
  rejected: { label: "Rejected", className: "bg-rose-500/15 text-rose-400" },
};

const WatchVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);

        const { data } = await api.get(`/api/studio/videos/${id}`);
        setVideo(data?.data?.video || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load video");
        navigate("/my-videos");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Loading video...
      </div>
    );
  }

  if (!video) return null;

  const meta = STATUS_META[video.status] || STATUS_META.pending;

  return (
    <div className="mx-auto max-w-7xl text-white">
      <NavLink
        to="/my-videos"
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-amber-200 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Videos
      </NavLink>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-white md:text-3xl">
              {video.title}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.className}`}
            >
              {meta.label}
            </span>
          </div>
        </div>

        <NavLink
          to={`/edit-video/${video.id}`}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#f59e0b]/15 px-5 py-3 text-sm font-bold text-amber-200 transition hover:bg-[#f59e0b]/25"
        >
          <Pencil className="h-4 w-4" />
          Edit Video
        </NavLink>
      </div>

      {video.status === "rejected" && video.rejectionReason && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <span className="font-bold">Rejection reason: </span>
          {video.rejectionReason}
        </div>
      )}

      <VideoPlayer
        src={showTrailer ? video.trailer?.url : video.video?.url}
        poster={`${api.defaults.baseURL}${video.thumbnail?.landscape}`}
        title={video.title}
      />

      {video.trailer?.url && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setShowTrailer(false)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              !showTrailer
                ? "bg-[#f59e0b]/20 text-amber-200"
                : "bg-black/30 text-slate-400 hover:text-white"
            }`}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Full Video
          </button>
          <button
            type="button"
            onClick={() => setShowTrailer(true)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              showTrailer
                ? "bg-[#f59e0b]/20 text-amber-200"
                : "bg-black/30 text-slate-400 hover:text-white"
            }`}
          >
            <Clapperboard className="h-3.5 w-3.5" />
            Trailer
          </button>
        </div>
      )}

      {video.description && (
        <p className="mt-6 rounded-2xl border border-[#f59e0b]/15 bg-white/[0.04] px-5 py-4 text-sm leading-relaxed text-slate-300">
          {video.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-bold text-amber-300">
          <Clock className="h-3.5 w-3.5" />
          {video.duration}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-bold text-amber-300">
          <Film className="h-3.5 w-3.5" />
          {video.category}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-bold text-amber-300">
          <ShieldAlert className="h-3.5 w-3.5" />
          {video.maturityRating}
        </span>
      </div>
    </div>
  );
};

export default WatchVideo;
