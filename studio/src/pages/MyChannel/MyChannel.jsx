import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImageUp, Save, Tv, Info } from "lucide-react";

import { api } from "../../api/axios";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const MyChannel = () => {
  const fileInputRef = useRef(null);

  const [channel, setChannel] = useState(null);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadChannel = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/studio/channel");
      const loaded = data?.data?.channel || data?.channel || null;

      setChannel(loaded);
      setName(loaded?.name || "");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load channel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannel();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, JPEG, WEBP, or GIF images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Channel name is required");
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      if (logoFile) formData.append("logo", logoFile);

      const { data } = await api.put("/api/studio/channel", formData);
      const updated = data?.data?.channel || data?.channel;

      setChannel(updated);
      setLogoFile(null);
      setPreviewUrl(null);
      toast.success(
        channel ? "Channel updated successfully" : "Channel created successfully",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save channel");
    } finally {
      setSaving(false);
    }
  };

  const currentLogoUrl = channel?.logo
    ? `${api.defaults.baseURL}${channel.logo}`
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Loading channel...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309] shadow-lg shadow-[#f59e0b]/30">
          <Tv className="h-6 w-6 text-black" />
        </div>

        <div>
          <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent">
            My Channel
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {channel
              ? "Manage your channel's name and logo."
              : "Create your channel to start building your presence on Pipra-TV."}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Channel Name
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/70 focus-within:ring-2 focus-within:ring-[#f59e0b]/20">
            <Tv className="h-5 w-5 text-[#f59e0b]" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Awesome Channel"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Channel Logo
          </label>

          {/* Clear upfront guidance so nobody has to ask what's allowed */}
          <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#f59e0b]/15 bg-[#f59e0b]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#f59e0b]" />
            <span>
              Use a square image, ideally{" "}
              <span className="font-bold text-white">500×500px</span>, for
              the best fit in circular channel logos — like the channel
              logos shown on the Pipra-TV client site. Max file size:{" "}
              <span className="font-bold text-white">20MB</span>. Supported
              formats:{" "}
              <span className="font-bold text-white">
                PNG, JPG, JPEG, WEBP, GIF
              </span>
              .
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#f59e0b]/25 bg-black/30">
              {previewUrl || currentLogoUrl ? (
                <img
                  src={previewUrl || currentLogoUrl}
                  alt="Channel logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Tv className="h-8 w-8 text-slate-500" />
              )}
            </div>

            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-5 py-3 text-sm font-bold text-amber-200 transition hover:bg-[#f59e0b]/20"
              >
                <ImageUp className="h-4 w-4" />
                {currentLogoUrl ? "Change Logo" : "Upload Logo"}
              </button>

              {logoFile && (
                <p className="mt-2 truncate text-xs text-slate-400">
                  Selected: {logoFile.name} (
                  {(logoFile.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] px-5 py-3.5 text-sm font-black text-black shadow-[0_18px_50px_rgba(245,158,11,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {saving ? "Saving..." : channel ? "Save Changes" : "Create Channel"}
        </button>
      </form>
    </div>
  );
};

export default MyChannel;
