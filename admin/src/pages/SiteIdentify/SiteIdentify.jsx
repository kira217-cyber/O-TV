import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImageUp, Info, Save, Trash2 } from "lucide-react";
import { FaFacebookF, FaTelegramPlane, FaYoutube } from "react-icons/fa";

import { api } from "../../api/axios";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const FAVICON_TYPES = [...IMAGE_TYPES, "image/x-icon", "image/vnd.microsoft.icon"];
const MAX_SIZE = 20 * 1024 * 1024;

const SiteIdentify = () => {
  const inputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const [logo, setLogo] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [favicon, setFavicon] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [savingFavicon, setSavingFavicon] = useState(false);
  const [clearingFavicon, setClearingFavicon] = useState(false);

  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [telegram, setTelegram] = useState("");
  const [savingSocial, setSavingSocial] = useState(false);

  const loadIdentity = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/site/identity");
      const identity = data?.data?.identity;
      setLogo(identity?.logo || null);
      setFavicon(identity?.favicon || null);
      setFacebook(identity?.socialLinks?.facebook || "");
      setYoutube(identity?.socialLinks?.youtube || "");
      setTelegram(identity?.socialLinks?.telegram || "");
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

  const handleFaviconChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isIco = /\.ico$/i.test(selected.name);

    if (!FAVICON_TYPES.includes(selected.type) && !isIco) {
      toast.error("Favicon must be PNG, ICO, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (selected.size > MAX_SIZE) {
      toast.error("Favicon must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setFaviconFile(selected);
    setFaviconPreview(URL.createObjectURL(selected));
  };

  const handleSaveFavicon = async () => {
    if (!faviconFile) {
      toast.error("Choose a favicon image first");
      return;
    }

    try {
      setSavingFavicon(true);

      const formData = new FormData();
      formData.append("favicon", faviconFile);

      const { data } = await api.put("/api/admin/site/identity/favicon", formData);

      setFavicon(data?.data?.identity?.favicon || null);
      setFaviconFile(null);
      setFaviconPreview(null);
      toast.success("Favicon updated — now live on the client site's browser tab");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update favicon");
    } finally {
      setSavingFavicon(false);
    }
  };

  const handleClearFavicon = async () => {
    if (!window.confirm("Remove the custom favicon and revert to the default?")) {
      return;
    }

    try {
      setClearingFavicon(true);
      await api.delete("/api/admin/site/identity/favicon");
      setFavicon(null);
      setFaviconFile(null);
      setFaviconPreview(null);
      toast.success("Custom favicon removed — default favicon restored");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to clear favicon");
    } finally {
      setClearingFavicon(false);
    }
  };

  const handleSaveSocial = async () => {
    try {
      setSavingSocial(true);

      const formData = new FormData();
      formData.append("facebook", facebook.trim());
      formData.append("youtube", youtube.trim());
      formData.append("telegram", telegram.trim());

      const { data } = await api.put("/api/admin/site/identity", formData);
      const identity = data?.data?.identity;

      setFacebook(identity?.socialLinks?.facebook || "");
      setYoutube(identity?.socialLinks?.youtube || "");
      setTelegram(identity?.socialLinks?.telegram || "");
      toast.success("Social links updated — now live on Footer");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update social links");
    } finally {
      setSavingSocial(false);
    }
  };

  const displayedPreview = preview || (logo ? `${api.defaults.baseURL}${logo}` : null);
  const displayedFavicon =
    faviconPreview || (favicon ? `${api.defaults.baseURL}${favicon}` : null);

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          Site Identify
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          The site logo shown on both the Navbar and Footer of the client site,
          plus the favicon shown in the browser tab.
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
                  No custom logo set — default Pipra-TV logo is shown
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

      <div className="mt-8 max-w-2xl rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Site Favicon
        </label>

        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
          <span>
            The small icon shown in the browser tab of the client site.
            Recommended a square{" "}
            <span className="font-bold text-white">512×512px</span> PNG (or a
            .ico file). Max file size:{" "}
            <span className="font-bold text-white">20MB</span>.
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : (
          <>
            <div className="mb-4 flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#8b5cf6]/25 bg-black/30">
              {displayedFavicon ? (
                <img
                  src={displayedFavicon}
                  alt="Site favicon preview"
                  className="h-16 w-16 rounded-lg object-contain"
                />
              ) : (
                <span className="text-xs text-slate-500">
                  No custom favicon set — default Pipra-TV favicon is shown
                </span>
              )}
            </div>

            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/x-icon,.ico"
              onChange={handleFaviconChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
              >
                <ImageUp className="h-4 w-4" />
                {favicon ? "Replace Favicon" : "Choose Favicon"}
              </button>

              <button
                type="button"
                onClick={handleSaveFavicon}
                disabled={!faviconFile || savingFavicon}
                className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingFavicon ? "Saving..." : "Save Favicon"}
              </button>

              {favicon && (
                <button
                  type="button"
                  onClick={handleClearFavicon}
                  disabled={clearingFavicon}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl bg-rose-500/15 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {clearingFavicon ? "Removing..." : "Remove Favicon"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 max-w-2xl rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Social Links
        </label>
        <p className="mb-4 text-xs text-slate-400">
          Shown as icons in the Footer's "Follow Us" section — each opens in
          a new tab. Leave a field empty to hide that icon.
        </p>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                <FaFacebookF className="h-3.5 w-3.5 text-[#1877f2]" />
                Facebook URL
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://www.facebook.com/yourpage"
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                <FaYoutube className="h-3.5 w-3.5 text-[#ff0000]" />
                YouTube URL
              </label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://www.youtube.com/@yourchannel"
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                <FaTelegramPlane className="h-3.5 w-3.5 text-[#229ed9]" />
                Telegram URL
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/yourchannel"
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSocial}
              disabled={savingSocial}
              className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingSocial ? "Saving..." : "Save Social Links"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteIdentify;
