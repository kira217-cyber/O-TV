import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImageUp, Info, Save, Trash2 } from "lucide-react";

import { api } from "../../api/axios";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE = 20 * 1024 * 1024;

const SLOTS = [
  { slot: "ads1", label: "Ads Banner 1", hint: "Shown above the Trending row" },
  { slot: "ads2", label: "Ads Banner 2", hint: "Shown further down the home page" },
];

const AdsSlotCard = ({ slot, label, hint, data, onSaved }) => {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [url, setUrl] = useState(data?.url || "");
  const [openInNewTab, setOpenInNewTab] = useState(data?.openInNewTab ?? true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    setUrl(data?.url || "");
    setOpenInNewTab(data?.openInNewTab ?? true);
  }, [data]);

  const handleImageChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!IMAGE_TYPES.includes(selected.type)) {
      toast.error("Image must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (selected.size > MAX_SIZE) {
      toast.error("Image must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!file && !data?.image) {
      toast.error("Choose a banner image first");
      return;
    }

    if (!url.trim()) {
      toast.error("Link URL is required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      if (file) formData.append("image", file);
      formData.append("url", url.trim());
      formData.append("openInNewTab", String(openInNewTab));

      const { data: res } = await api.put(`/api/admin/site/ads/${slot}`, formData);

      onSaved(res?.data?.ads);
      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(`${label} updated`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update ad banner");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm(`Clear ${label}? It will stop showing on the home page.`)) {
      return;
    }

    try {
      setClearing(true);
      const { data: res } = await api.delete(`/api/admin/site/ads/${slot}`);
      onSaved(res?.data?.ads);
      setFile(null);
      setPreview(null);
      toast.success(`${label} cleared`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to clear ad banner");
    } finally {
      setClearing(false);
    }
  };

  const displayedPreview = preview || (data?.image ? `${api.defaults.baseURL}${data.image}` : null);

  return (
    <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
      <h2 className="text-lg font-black text-white">{label}</h2>
      <p className="mb-4 text-xs text-slate-400">{hint}</p>

      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
        <span>
          Recommended <span className="font-bold text-white">1800×300px</span>{" "}
          (wide banner). Max file size: <span className="font-bold text-white">20MB</span>.
        </span>
      </div>

      <div className="mb-4 flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#8b5cf6]/25 bg-black/30">
        {displayedPreview ? (
          <img src={displayedPreview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-slate-500">No banner set yet</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleImageChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mb-4 flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
      >
        <ImageUp className="h-3.5 w-3.5" />
        {data?.image ? "Replace Image" : "Choose Image"}
      </button>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Link URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
        />
      </div>

      <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3">
        <input
          type="checkbox"
          checked={openInNewTab}
          onChange={(e) => setOpenInNewTab(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[#8b5cf6]"
        />
        <span className="text-sm text-slate-200">
          Open link in a new blank page (unchecked = opens in the same page)
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </button>

        {data?.image && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-rose-500/15 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {clearing ? "Clearing..." : "Clear"}
          </button>
        )}
      </div>
    </div>
  );
};

const SiteAds = () => {
  const [adsBySlot, setAdsBySlot] = useState({});
  const [loading, setLoading] = useState(true);

  const loadAds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/site/ads");
      const map = {};
      (data?.data?.ads || []).forEach((entry) => {
        map[entry.slot] = entry;
      });
      setAdsBySlot(map);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load ads settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleSaved = (slot, updated) => {
    setAdsBySlot((prev) => ({ ...prev, [slot]: updated }));
  };

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          Ads Images
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Manage the two clickable ad banners shown on the client home page.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SLOTS.map(({ slot, label, hint }) => (
            <AdsSlotCard
              key={slot}
              slot={slot}
              label={label}
              hint={hint}
              data={adsBySlot[slot]}
              onSaved={(updated) => handleSaved(slot, updated)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SiteAds;
