import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImageUp, Info, Layers, Save } from "lucide-react";

import { api } from "../../api/axios";
import PromotedVideosPanel from "../PromotedVideosPanel/PromotedVideosPanel";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE = 20 * 1024 * 1024;

const BackgroundSlot = ({ label, sizeHint, previewUrl, onChange, fileName }) => {
  const inputRef = useRef(null);

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </label>

      <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
        <span>
          Recommended <span className="font-bold text-white">{sizeHint}</span>.
          Max file size: <span className="font-bold text-white">20MB</span>.
        </span>
      </div>

      <div className="mb-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#8b5cf6]/25 bg-black/30">
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-slate-500">No image set</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={onChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
      >
        <ImageUp className="h-3.5 w-3.5" />
        {previewUrl ? "Replace Image" : "Choose Image"}
      </button>

      {fileName && (
        <p className="mt-2 truncate text-xs text-slate-400">Selected: {fileName}</p>
      )}
    </div>
  );
};

const HomeSectionEditor = ({
  sectionKey,
  pageTitle,
  description,
  supportsBackground = false,
  promotable = false,
}) => {
  const [section, setSection] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [desktopFile, setDesktopFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(null);

  const loadSection = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/admin/site/home-sections/${sectionKey}`);
      setSection(data?.data?.section || null);
      setTitle(data?.data?.section?.title || "");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load section");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  const handleDesktopChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Image must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Image must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setDesktopFile(file);
    setDesktopPreview(URL.createObjectURL(file));
  };

  const handleMobileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Image must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Image must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setMobileFile(file);
    setMobilePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Section title is required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      if (desktopFile) formData.append("backgroundDesktop", desktopFile);
      if (mobileFile) formData.append("backgroundMobile", mobileFile);

      const { data } = await api.put(
        `/api/admin/site/home-sections/${sectionKey}`,
        formData,
      );

      setSection(data?.data?.section || null);
      setDesktopFile(null);
      setDesktopPreview(null);
      setMobileFile(null);
      setMobilePreview(null);
      toast.success("Section updated — now live on the home page");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update section");
    } finally {
      setSaving(false);
    }
  };

  const desktopDisplay =
    desktopPreview || (section?.backgroundDesktop ? `${api.defaults.baseURL}${section.backgroundDesktop}` : null);
  const mobileDisplay =
    mobilePreview || (section?.backgroundMobile ? `${api.defaults.baseURL}${section.backgroundMobile}` : null);

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-4 py-3">
          <Layers className="h-5 w-5 text-[#8b5cf6]" />
          <span className="text-sm font-bold text-violet-200">Home Page Section</span>
        </div>

        <h1 className="mt-4 bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          {pageTitle}
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          {description || "Control the title text shown for this section on the home page."}
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading...</div>
      ) : (
        <form
          onSubmit={handleSave}
          className="max-w-2xl space-y-6 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Section Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Section title shown on the home page"
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>

          {supportsBackground && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <BackgroundSlot
                label="Background — Desktop/Laptop"
                sizeHint="1920×720px"
                previewUrl={desktopDisplay}
                fileName={desktopFile?.name}
                onChange={handleDesktopChange}
              />
              <BackgroundSlot
                label="Background — Mobile"
                sizeHint="1080×1440px"
                previewUrl={mobileDisplay}
                fileName={mobileFile?.name}
                onChange={handleMobileChange}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {promotable && <PromotedVideosPanel sectionKey={sectionKey} />}
    </div>
  );
};

export default HomeSectionEditor;
