import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Search,
  X,
  Pencil,
  Trash2,
  Save,
  PlayCircle,
  ListVideo,
  ImageUp,
  UploadCloud,
  Info,
  Film,
} from "lucide-react";

import { api } from "../../api/axios";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/3gpp",
];
const MAX_THUMBNAIL_SIZE = 20 * 1024 * 1024;

const PrivatePlaylistVideosBrowser = () => {
  const [playlists, setPlaylists] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editShortDescription, setEditShortDescription] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState(null);
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [editVideoPreview, setEditVideoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  const base = api.defaults.baseURL;

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const { data } = await api.get("/api/admin/private-playlists");
        setPlaylists(data?.data?.playlists || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load playlists");
      }
    };

    loadPlaylists();
  }, []);

  const loadVideos = async (playlistId) => {
    try {
      setLoadingVideos(true);
      const { data } = await api.get("/api/admin/private-videos", {
        params: { playlist: playlistId },
      });
      setVideos(data?.data?.videos || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load videos");
    } finally {
      setLoadingVideos(false);
    }
  };

  const selectPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setSearch("");
    setEditingId(null);
    loadVideos(playlist._id || playlist.id);
  };

  const clearSelection = () => {
    setSelectedPlaylist(null);
    setVideos([]);
    setEditingId(null);
  };

  const filteredPlaylists = search.trim()
    ? playlists.filter((p) => p.title?.toLowerCase().includes(search.trim().toLowerCase()))
    : playlists;

  const startEdit = (video) => {
    setEditingId(video._id || video.id);
    setEditTitle(video.title);
    setEditShortDescription(video.shortDescription);
    setEditThumbnailFile(null);
    // Preview always shows something while editing — the current
    // thumbnail/video until a replacement is picked, then the replacement.
    setEditThumbnailPreview(video.thumbnail ? `${base}${video.thumbnail}` : null);
    setEditVideoFile(null);
    setEditVideoPreview(video.video?.url || null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditShortDescription("");
    setEditThumbnailFile(null);
    setEditThumbnailPreview(null);
    setEditVideoFile(null);
    setEditVideoPreview(null);
  };

  const handleEditThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Thumbnail must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      toast.error("Thumbnail must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setEditThumbnailFile(file);
    setEditThumbnailPreview(URL.createObjectURL(file));
  };

  const handleEditVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error("Video files must be MP4, WEBM, MOV, MKV, or AVI");
      e.target.value = "";
      return;
    }

    setEditVideoFile(file);
    setEditVideoPreview(URL.createObjectURL(file));
  };

  // Replacing the video file goes through the same rollback-safe route as
  // create (server/routes/adminPrivateVideoRoutes.js PUT /:id) — the old
  // Bunny file only gets deleted once the new one is safely uploaded and
  // saved, so the previous video is never lost mid-swap.
  const saveEdit = async (video) => {
    const id = video._id || video.id;

    if (!editTitle.trim() || !editShortDescription.trim()) {
      toast.error("Title and short description are required");
      return;
    }

    const uploadId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const formData = new FormData();
    formData.append("title", editTitle.trim());
    formData.append("shortDescription", editShortDescription.trim());
    if (editThumbnailFile) formData.append("thumbnail", editThumbnailFile);
    if (editVideoFile) {
      formData.append("video", editVideoFile);
      formData.append("uploadId", uploadId);
    }

    let bunnyPercent = 0;
    const pollBunnyProgress = editVideoFile
      ? setInterval(async () => {
          try {
            const { data } = await api.get(
              `/api/admin/private-videos/upload-progress/${uploadId}`,
            );
            bunnyPercent = data?.data?.percent ?? bunnyPercent;
            setSaveProgress((previous) => Math.max(previous, 50 + Math.round(bunnyPercent / 2)));
          } catch {
            // Non-critical — the bar just won't advance this tick.
          }
        }, 400)
      : null;

    try {
      setSaving(true);
      setSaveProgress(0);

      const onUploadProgress = (event) => {
        if (!event.total) return;
        const clientPercent = Math.round((event.loaded / event.total) * 100);
        setSaveProgress((previous) =>
          Math.max(previous, editVideoFile ? Math.round(clientPercent / 2) : clientPercent),
        );
      };

      await api.put(`/api/admin/private-videos/${id}`, formData, { onUploadProgress });
      toast.success("Video updated");
      cancelEdit();
      loadVideos(selectedPlaylist._id || selectedPlaylist.id);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update the video");
    } finally {
      if (pollBunnyProgress) clearInterval(pollBunnyProgress);
      setSaving(false);
      setSaveProgress(0);
    }
  };

  const handleDelete = async (video) => {
    const id = video._id || video.id;
    if (!window.confirm(`Delete "${video.title}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/api/admin/private-videos/${id}`);
      setVideos((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (editingId === id) cancelEdit();
      toast.success("Video deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete the video");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 text-white">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] shadow-lg shadow-[#8b5cf6]/30">
          <ListVideo className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent">
            Playlist Videos
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Pick a playlist to browse, edit, delete, or preview its videos.
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <label className="mb-2 block text-sm font-semibold text-slate-200">Select Playlist</label>

        {selectedPlaylist ? (
          <div className="flex items-center gap-4 rounded-2xl border border-[#8b5cf6]/25 bg-black/30 p-3">
            <img
              src={`${base}${selectedPlaylist.logo}`}
              alt={selectedPlaylist.title}
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="truncate text-sm font-bold text-white">{selectedPlaylist.title}</p>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
              Change
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b5cf6]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search or pick a playlist..."
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            {filteredPlaylists.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">No playlists found.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {filteredPlaylists.map((playlist) => (
                  <button
                    key={playlist._id || playlist.id}
                    type="button"
                    onClick={() => selectPlaylist(playlist)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/25 p-2.5 text-left transition hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10"
                  >
                    <img
                      src={`${base}${playlist.logo}`}
                      alt={playlist.title}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                      {playlist.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedPlaylist && (
        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
          <h2 className="mb-4 text-lg font-black text-white">
            Videos in "{selectedPlaylist.title}" {videos.length > 0 && `(${videos.length})`}
          </h2>

          {loadingVideos ? (
            <div className="py-10 text-center text-slate-400">Loading...</div>
          ) : videos.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              No videos in this playlist yet.
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => {
                const id = video._id || video.id;
                const isEditing = editingId === id;

                return (
                  <div
                    key={id}
                    className="rounded-2xl border border-[#8b5cf6]/15 bg-black/30 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <img
                        src={`${base}${video.thumbnail}`}
                        alt={video.title}
                        className="h-20 w-32 shrink-0 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{video.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {video.shortDescription}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setPlayingVideo(video)}
                          className="flex cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-3 py-2 text-violet-200 transition hover:bg-[#8b5cf6]/25"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => (isEditing ? cancelEdit() : startEdit(video))}
                          className="flex cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-3 py-2 text-violet-200 transition hover:bg-[#8b5cf6]/25"
                        >
                          {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(video)}
                          disabled={deletingId === id}
                          className="flex cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2 text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-4 space-y-4 border-t border-[#8b5cf6]/15 pt-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Short Description
                          </label>
                          <textarea
                            value={editShortDescription}
                            onChange={(e) => setEditShortDescription(e.target.value)}
                            rows={2}
                            className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Replace Thumbnail (optional)
                          </label>
                          <div className="mb-2 flex items-start gap-2 rounded-xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-3 py-2.5 text-[11px] leading-relaxed text-slate-300">
                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />
                            <span>
                              Recommended <span className="font-bold text-white">1280×720px</span>{" "}
                              (16:9). Max size: <span className="font-bold text-white">20MB</span>.
                            </span>
                          </div>
                          <input
                            type="file"
                            id={`edit-thumbnail-${id}`}
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleEditThumbnailChange}
                            className="hidden"
                          />
                          <label
                            htmlFor={`edit-thumbnail-${id}`}
                            className="flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
                          >
                            <ImageUp className="h-3.5 w-3.5" />
                            {editThumbnailFile ? "Change File" : "Choose File"}
                          </label>
                          {editThumbnailPreview && (
                            <div className="mt-3">
                              <p className="mb-1.5 text-[11px] font-semibold text-slate-400">
                                {editThumbnailFile ? "New thumbnail" : "Current thumbnail"}
                              </p>
                              <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-[#8b5cf6]/20">
                                <img
                                  src={editThumbnailPreview}
                                  alt="Thumbnail preview"
                                  className="aspect-video w-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Replace Video (optional)
                          </label>
                          <p className="mb-2 text-[11px] text-slate-400">
                            Uploading a new file permanently deletes the current video from
                            storage and puts the new one in its place.
                          </p>
                          <input
                            type="file"
                            id={`edit-video-${id}`}
                            accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
                            onChange={handleEditVideoChange}
                            className="hidden"
                          />
                          <label
                            htmlFor={`edit-video-${id}`}
                            className="flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
                          >
                            <UploadCloud className="h-3.5 w-3.5" />
                            {editVideoFile ? "Change File" : "Choose File"}
                          </label>
                          {editVideoFile && (
                            <p className="mt-2 truncate text-xs text-slate-400">
                              Selected: {editVideoFile.name}
                            </p>
                          )}
                          {editVideoPreview && (
                            <div className="mt-3">
                              <p className="mb-1.5 text-[11px] font-semibold text-slate-400">
                                {editVideoFile ? "New video" : "Current video"}
                              </p>
                              <video
                                src={editVideoPreview}
                                controls
                                className="w-full max-w-md rounded-2xl border border-[#8b5cf6]/20 bg-black"
                              />
                            </div>
                          )}
                        </div>

                        {saving && editVideoFile && (
                          <div>
                            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-300">
                              <span className="flex items-center gap-1.5">
                                <Film className="h-3.5 w-3.5 text-[#8b5cf6]" />
                                Uploading...
                              </span>
                              <span>{saveProgress}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] transition-all duration-200"
                                style={{ width: `${saveProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => saveEdit(video)}
                          disabled={saving}
                          className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {playingVideo && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPlayingVideo(null)}
        >
          <div
            className="w-full max-w-3xl rounded-[24px] border border-[#8b5cf6]/25 bg-[#0b0e0f] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="truncate text-sm font-bold text-white">{playingVideo.title}</p>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="cursor-pointer rounded-lg bg-white/10 p-2 text-slate-300 transition hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <video
              src={playingVideo.video?.url}
              controls
              autoPlay
              className="max-h-[70vh] w-full rounded-2xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivatePlaylistVideosBrowser;
