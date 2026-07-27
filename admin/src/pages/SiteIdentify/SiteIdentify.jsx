import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImageUp, Info, Save, Trash2 } from "lucide-react";

import { api } from "../../api/axios";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE = 20 * 1024 * 1024;

const SiteIdentify = () => {
  const inputRef = useRef(null);

  const [logo, setLogo] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadIdentity = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/site/identity");
      setLogo(data?.data?.identity?.logo || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load site logo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdentity();
  }, []);

  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!IMAGE_TYPES.includes(selected.type)) {
      toast.error("Logo must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (selected.size > MAX_SIZE) {
      toast.error("Logo must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!file) {
      toast.error("Choose a logo image first");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("logo", file);

      const { data } = await api.put("/api/admin/site/identity", formData);

      setLogo(data?.data?.identity?.logo || null);
      setFile(null);
      setPreview(null);
      toast.success("Site logo updated — now live on Navbar and Footer");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update logo");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Remove the custom logo and revert to the default?")) {
      return;
    }

    try {
      setClearing(true);
      await api.delete("/api/admin/site/identity");
      setLogo(null);
      setFile(null);
      setPreview(null);
      toast.success("Custom logo removed — default logo restored");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to clear logo");
    } finally {
      setClearing(false);
    }
  };

  const displayedPreview = preview || (logo ? `${api.defaults.baseURL}${logo}` : null);

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          Site Identify
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          The site logo shown on both the Navbar and Footer of the client site.
        </p>
      </div>

      <div className="max-w-2xl rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Site Logo
        </label>

        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
          <span>
            Recommended <span className="font-bold text-white">400×120px</span>{" "}
            transparent PNG (wide logo, will scale to fit). Used on both the
            Navbar and Footer. Max file size:{" "}
            <span className="font-bold text-white">20MB</span>.
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : (
          <>
            <div className="mb-4 flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#8b5cf6]/25 bg-black/30">
              {displayedPreview ? (
                <img
                  src={displayedPreview}
                  alt="Site logo preview"
                  className="max-h-24 max-w-[85%] object-contain"
                />
              ) : (
                <span className="text-xs text-slate-500">
                  No custom logo set — default O-TV logo is shown
                </span>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
              >
                <ImageUp className="h-4 w-4" />
                {logo ? "Replace Logo" : "Choose Logo"}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!file || saving}
                className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Logo"}
              </button>

              {logo && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={clearing}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl bg-rose-500/15 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {clearing ? "Removing..." : "Remove Logo"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SiteIdentify;
