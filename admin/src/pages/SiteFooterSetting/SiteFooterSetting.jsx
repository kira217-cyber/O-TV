import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImageUp, Info, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { api } from "../../api/axios";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE = 20 * 1024 * 1024;

const emptyForm = { label: "", url: "", openInNewTab: true };

const SiteFooterSetting = () => {
  const inputRef = useRef(null);

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/site/footer-links");
      setLinks(data?.data?.links || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load footer links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const startEdit = (link) => {
    setEditingId(link._id || link.id);
    setForm({ label: link.label, url: link.url, openInNewTab: link.openInNewTab });
    setFile(null);
    setPreview(null);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.label.trim() || !form.url.trim()) {
      toast.error("Label and URL are required");
      return;
    }

    if (!editingId && !file) {
      toast.error("Button image is required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("label", form.label.trim());
      formData.append("url", form.url.trim());
      formData.append("openInNewTab", String(form.openInNewTab));
      if (file) formData.append("image", file);

      if (editingId) {
        await api.put(`/api/admin/site/footer-links/${editingId}`, formData);
        toast.success("Footer link updated");
      } else {
        await api.post("/api/admin/site/footer-links", formData);
        toast.success("Footer link created");
      }

      resetForm();
      loadLinks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save footer link");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (link) => {
    const id = link._id || link.id;
    if (!window.confirm(`Delete "${link.label}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/api/admin/site/footer-links/${id}`);
      setLinks((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (editingId === id) resetForm();
      toast.success("Footer link deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete footer link");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          Footer Setting
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Manage the "Download App For" buttons shown in the site footer —
          image, label, and destination link for each button.
        </p>
      </div>

      <div className="mb-8 max-w-2xl rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <h2 className="mb-4 text-lg font-black text-white">
          {editingId ? "Edit Download Button" : "Add Download Button"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Button Image
            </label>

            <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
              <span>
                Recommended <span className="font-bold text-white">400×120px</span>{" "}
                (wide badge, e.g. Google Play / App Store style). Max file size:{" "}
                <span className="font-bold text-white">20MB</span>.
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#8b5cf6]/25 bg-black/30">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                ) : (
                  <ImageUp className="h-5 w-5 text-slate-500" />
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
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
              >
                <ImageUp className="h-3.5 w-3.5" />
                Choose Image
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Label
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Google Play"
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Link URL
              </label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3">
            <input
              type="checkbox"
              checked={form.openInNewTab}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, openInNewTab: e.target.checked }))
              }
              className="h-4 w-4 cursor-pointer accent-[#8b5cf6]"
            />
            <span className="text-sm text-slate-200">
              Open link in a new blank page (unchecked = opens in the same page)
            </span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : editingId ? "Update Button" : "Add Button"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-black/30 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#8b5cf6]/15"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <h2 className="mb-4 text-lg font-black text-white">
          Current Download Buttons
        </h2>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : links.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No download buttons yet — add one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => {
              const id = link._id || link.id;

              return (
                <div
                  key={id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/30 p-4"
                >
                  <div className="flex h-14 items-center justify-center overflow-hidden rounded-xl bg-black/40">
                    <img
                      src={`${api.defaults.baseURL}${link.image}`}
                      alt={link.label}
                      className="h-full max-w-[85%] object-contain"
                    />
                  </div>

                  <div>
                    <p className="truncate text-sm font-bold text-white">{link.label}</p>
                    <p className="truncate text-xs text-slate-400">{link.url}</p>
                    <p className="mt-1 text-[11px] font-semibold text-violet-300">
                      {link.openInNewTab ? "Opens in new tab" : "Opens in same page"}
                    </p>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(link)}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#8b5cf6]/15 px-3 py-2 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/25"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(link)}
                      disabled={deletingId === id}
                      className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteFooterSetting;
