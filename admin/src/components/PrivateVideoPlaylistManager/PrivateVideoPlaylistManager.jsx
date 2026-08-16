import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ImageUp, Pencil, Save, Trash2, X, ListMusic, Info } from "lucide-react";

import { api } from "../../api/axios";

const PrivateVideoPlaylistManager = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/private-playlists");
      setPlaylists(data?.data?.playlists || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Logo must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setLogoFile(null);
    setLogoPreview(null);
  };

  const startEdit = (playlist) => {
    setEditingId(playlist._id || playlist.id);
    setTitle(playlist.title);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!editingId && !logoFile) {
      toast.error("A logo image is required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      if (logoFile) formData.append("logo", logoFile);

      if (editingId) {
        await api.put(`/api/admin/private-playlists/${editingId}`, formData);
        toast.success("Playlist updated");
      } else {
        await api.post("/api/admin/private-playlists", formData);
        toast.success("Playlist created");
      }

      resetForm();
      loadPlaylists();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save the playlist");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (playlist) => {
    const id = playlist._id || playlist.id;
    if (
      !window.confirm(
        `Delete "${playlist.title}"? Every video inside it will be permanently deleted too.`,
      )
    )
      return;

    try {
      setDeletingId(id);
      await api.delete(`/api/admin/private-playlists/${id}`);
      setPlaylists((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (editingId === id) resetForm();
      toast.success("Playlist deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete the playlist");
    } finally {
      setDeletingId(null);
    }
  };

  const base = api.defaults.baseURL;

  return (
    <div className="mx-auto max-w-7xl space-y-8 text-white">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] shadow-lg shadow-[#8b5cf6]/30">
          <ListMusic className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent">
            Private Video Playlist
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create playlists to organize private videos under.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        <h2 className="mb-4 text-lg font-black text-white">
          {editingId ? "Edit Playlist" : "Add Playlist"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Playlist Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VIP Collection"
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Logo</label>

            <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
              <span>
                Recommended <span className="font-bold text-white">500×500px</span> (square).
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#8b5cf6]/25 bg-black/30">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageUp className="h-5 w-5 text-slate-500" />
                )}
              </div>

              <input
                type="file"
                id="private-playlist-logo-input"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleLogoChange}
                className="hidden"
              />
              <label
                htmlFor="private-playlist-logo-input"
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
              >
                <ImageUp className="h-3.5 w-3.5" />
                Choose Logo
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : editingId ? "Update Playlist" : "Create Playlist"}
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
        </div>
      </form>

      <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <h2 className="mb-4 text-lg font-black text-white">
          Playlists {playlists.length > 0 && `(${playlists.length})`}
        </h2>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : playlists.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No playlists yet — add one above.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {playlists.map((playlist) => {
              const id = playlist._id || playlist.id;

              return (
                <div
                  key={id}
                  className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-[#8b5cf6]/15 bg-black/30 p-2.5"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40">
                    <img
                      src={`${base}${playlist.logo}`}
                      alt={playlist.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <p className="truncate text-center text-xs font-semibold text-white">
                    {playlist.title}
                  </p>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(playlist)}
                      className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-2 py-1.5 text-violet-200 transition hover:bg-[#8b5cf6]/25"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(playlist)}
                      disabled={deletingId === id}
                      className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 px-2 py-1.5 text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
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

export default PrivateVideoPlaylistManager;
