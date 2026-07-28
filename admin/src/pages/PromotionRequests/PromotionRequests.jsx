import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Megaphone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Hourglass,
  Clock,
  Calendar,
} from "lucide-react";

import { api } from "../../api/axios";
import { PROMOTABLE_SECTIONS } from "../../constants/videoOptions";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_META = {
  pending: {
    label: "Pending Review",
    className: "bg-amber-500/15 text-amber-400",
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

const sectionLabel = (key) =>
  PROMOTABLE_SECTIONS.find((section) => section.key === key)?.label || key;

const PromotionRequests = () => {
  const [status, setStatus] = useState("pending");
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadPromotions = async (statusFilter) => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/promotions", {
        params: { status: statusFilter || undefined },
      });
      setPromotions(data?.data?.promotions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load promotion requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleApprove = async (promotion) => {
    try {
      setDecidingId(promotion._id);
      await api.patch(`/api/admin/promotions/${promotion._id}/status`, {
        status: "approved",
      });
      toast.success("Promotion approved and is now live");
      loadPromotions(status);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve promotion");
    } finally {
      setDecidingId(null);
    }
  };

  const handleReject = async (promotion) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejecting this request");
      return;
    }

    try {
      setDecidingId(promotion._id);
      await api.patch(`/api/admin/promotions/${promotion._id}/status`, {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Promotion request rejected");
      setRejectingId(null);
      setRejectionReason("");
      loadPromotions(status);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject promotion");
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-4 py-3">
          <Megaphone className="h-5 w-5 text-[#8b5cf6]" />
          <span className="text-sm font-bold text-violet-200">Promotion Requests</span>
        </div>

        <h1 className="mt-4 bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          Promotion Requests
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          Review requests from studio users asking to feature their videos on
          the home page.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
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

        <button
          onClick={() => loadPromotions(status)}
          disabled={loading}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
          Loading...
        </div>
      ) : promotions.length === 0 ? (
        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
          No {status} promotion requests.
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map((promotion) => {
            const meta = STATUS_META[promotion.status] || STATUS_META.pending;
            const StatusIcon = meta.icon;
            const base = api.defaults.baseURL;

            return (
              <div
                key={promotion._id}
                className="rounded-[24px] border border-[#8b5cf6]/15 bg-black/30 p-5 transition hover:border-[#8b5cf6]/35"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {promotion.video?.thumbnail?.landscape && (
                    <img
                      src={`${base}${promotion.video.thumbnail.landscape}`}
                      alt={promotion.video?.title}
                      className="h-24 w-40 shrink-0 rounded-xl object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-black text-white">
                        {promotion.video?.title || "Video removed"}
                      </p>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${meta.className}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {promotion.studioUser?.channel?.name || promotion.studioUser?.fullName} ·{" "}
                      {promotion.studioUser?.email}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {promotion.sections.map((key) => (
                        <span
                          key={key}
                          className="rounded-full bg-[#8b5cf6]/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300"
                        >
                          {sectionLabel(key)}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {promotion.requestedBy === "admin" ? "Admin direct" : "Studio request"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {promotion.scheduleType === "lifetime"
                          ? "Lifetime"
                          : `Until ${new Date(promotion.endDate).toLocaleDateString()}`}
                      </span>
                    </div>

                    {promotion.status === "rejected" && promotion.rejectionReason && (
                      <p className="mt-2 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">
                        {promotion.rejectionReason}
                      </p>
                    )}
                  </div>

                  {promotion.status === "pending" && (
                    <div className="flex shrink-0 flex-col gap-2 sm:w-40">
                      <button
                        onClick={() => handleApprove(promotion)}
                        disabled={decidingId === promotion._id}
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          setRejectingId(rejectingId === promotion._id ? null : promotion._id)
                        }
                        disabled={decidingId === promotion._id}
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {rejectingId === promotion._id && (
                  <div className="mt-4 space-y-3 border-t border-[#8b5cf6]/15 pt-4">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={2}
                      placeholder="Explain why this promotion request is being rejected..."
                      className="w-full rounded-2xl border border-rose-500/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-rose-500/70 focus:ring-2 focus:ring-rose-500/20"
                    />
                    <button
                      onClick={() => handleReject(promotion)}
                      disabled={decidingId === promotion._id}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-2.5 text-sm font-black text-white transition hover:bg-rose-600 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      {decidingId === promotion._id ? "Submitting..." : "Confirm Rejection"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromotionRequests;
