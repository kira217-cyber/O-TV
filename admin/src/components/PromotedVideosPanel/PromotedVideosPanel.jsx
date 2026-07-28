import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Calendar, Pencil, Save, Trash2, X } from "lucide-react";

import { api } from "../../api/axios";

const todayISO = () => new Date().toISOString().slice(0, 10);

const PromotedVideosPanel = ({ sectionKey }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editScheduleType, setEditScheduleType] = useState("campaign");
  const [editEndDate, setEditEndDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/promotions", {
        params: { section: sectionKey, status: "approved" },
      });
      setPromotions(data?.data?.promotions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load promoted videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  const startEdit = (promotion) => {
    setEditingId(promotion._id);
    setEditScheduleType(promotion.scheduleType);
    setEditEndDate(promotion.endDate ? promotion.endDate.slice(0, 10) : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditScheduleType("campaign");
    setEditEndDate("");
  };

  const saveEdit = async (id) => {
    if (editScheduleType === "campaign" && !editEndDate) {
      toast.error("Choose an end date for the campaign schedule");
      return;
    }

    try {
      setSavingEdit(true);
      await api.put(`/api/admin/promotions/${id}`, {
        scheduleType: editScheduleType,
        endDate:
          editScheduleType === "campaign" ? new Date(editEndDate).toISOString() : undefined,
      });
      toast.success("Promotion schedule updated");
      cancelEdit();
      loadPromotions();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update schedule");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemove = async (promotion) => {
    if (
      !window.confirm(
        `Remove "${promotion.video?.title || "this video"}" from this section? The video itself will not be deleted.`,
      )
    ) {
      return;
    }

    try {
      setRemovingId(promotion._id);
      await api.delete(`/api/admin/promotions/${promotion._id}`);
      setPromotions((prev) => prev.filter((item) => item._id !== promotion._id));
      toast.success("Promotion removed from this section");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove promotion");
    } finally {
      setRemovingId(null);
    }
  };

  const base = api.defaults.baseURL;

  return (
    <div className="mt-8 max-w-2xl rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
      <h2 className="mb-4 text-lg font-black text-white">Promoted Videos</h2>

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading...</div>
      ) : promotions.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          No videos are currently promoted in this section.
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promotion) => (
            <div
              key={promotion._id}
              className="rounded-2xl border border-[#8b5cf6]/15 bg-black/25 p-4"
            >
              <div className="flex items-center gap-3">
                {promotion.video?.thumbnail?.landscape && (
                  <img
                    src={`${base}${promotion.video.thumbnail.landscape}`}
                    alt={promotion.video?.title}
                    className="h-12 w-20 shrink-0 rounded-lg object-cover"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {promotion.video?.title || "Video removed"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {promotion.studioUser?.channel?.name || promotion.studioUser?.fullName}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-violet-300">
                    <Calendar className="h-3 w-3" />
                    {promotion.scheduleType === "lifetime"
                      ? "Lifetime"
                      : `Until ${new Date(promotion.endDate).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => startEdit(promotion)}
                    className="flex cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-3 py-2 text-violet-200 transition hover:bg-[#8b5cf6]/25"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemove(promotion)}
                    disabled={removingId === promotion._id}
                    className="flex cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2 text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {editingId === promotion._id && (
                <div className="mt-3 space-y-3 border-t border-[#8b5cf6]/15 pt-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditScheduleType("campaign")}
                      className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        editScheduleType === "campaign"
                          ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                          : "border-[#8b5cf6]/15 bg-black/25 text-slate-400"
                      }`}
                    >
                      Campaign
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditScheduleType("lifetime")}
                      className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        editScheduleType === "lifetime"
                          ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-violet-200"
                          : "border-[#8b5cf6]/15 bg-black/25 text-slate-400"
                      }`}
                    >
                      Lifetime
                    </button>
                  </div>

                  {editScheduleType === "campaign" && (
                    <input
                      type="date"
                      value={editEndDate}
                      min={todayISO()}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full max-w-xs rounded-xl border border-[#8b5cf6]/20 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-[#8b5cf6]/70"
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(promotion._id)}
                      disabled={savingEdit}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#a78bfa] disabled:opacity-60"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#8b5cf6]/25 bg-black/30 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-[#8b5cf6]/15"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotedVideosPanel;
