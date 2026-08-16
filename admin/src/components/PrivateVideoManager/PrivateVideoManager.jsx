import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  ImageUp,
  UploadCloud,
  Search,
  X,
  Pencil,
  Trash2,
  Save,
  Video as VideoIcon,
  Film,
  ChevronLeft,
  ChevronRight,
  Info,
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
const PAGE_SIZE = 20;

const PlaylistPicker = ({ selectedPlaylist, onSelect, onClear }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const base = api.defaults.baseURL;

  useEffect(() => {
    if (selectedPlaylist || !search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const { data } = await api.get("/api/admin/private-playlists");
        const all = data?.data?.playlists || [];
        const q = search.trim().toLowerCase();
        setResults(all.filter((p) => p.title?.toLowerCase().includes(q)));
      } catch (error) {
        toast.error(error?.response?.data?.message || "Playlist search failed");
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search, selectedPlaylist]);

  if (selectedPlaylist) {
    return (
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
          onClick={onClear}
          className="flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/20"
        >
          <X className="h-3.5 w-3.5" />
          Change
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b5cf6]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search playlist title..."
          className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
        />
      </div>

      {searching && <p className="mt-2 text-xs text-slate-400">Searching...</p>}

      {!searching && search.trim() && results.length === 0 && (
        <p className="mt-2 text-xs text-slate-400">No matching playlists found.</p>
      )}

      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map((playlist) => (
            <button
              key={playlist._id || playlist.id}
              type="button"
              onClick={() => {
                onSelect(playlist);
                setResults([]);
                setSearch("");
              }}
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
  );
};

const PrivateVideoManager = () => {
  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const base = api.defaults.baseURL;

  const loadVideos = async (pageNumber = 1) => {
    try {
      setLoadingVideos(true);
      const { data } = await api.get("/api/admin/private-videos", {
        params: { page: pageNumber, limit: PAGE_SIZE },
      });
      const payload = data?.data || {};
      setVideos(payload.videos || []);
      setTotalPages(payload.totalPages || 1);
      setTotal(payload.total || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load private videos");
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    loadVideos(1);
  }, []);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    loadVideos(nextPage);
  };

  const handleThumbnailChange = (e) => {
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

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error("Video files must be MP4, WEBM, MOV, MKV, or AVI");
      e.target.value = "";
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedPlaylist(null);
    setTitle("");
    setShortDescription("");
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const startEdit = (video) => {
    setEditingId(video._id || video.id);
    setSelectedPlaylist(video.playlist || null);
    setTitle(video.title);
    setShortDescription(video.shortDescription);
    setThumbnailFile(null);
    // Preview always shows something during edit — the current thumbnail/
    // video until a replacement is chosen, then the replacement itself.
    setThumbnailPreview(video.thumbnail ? `${base}${video.thumbnail}` : null);
    setVideoFile(null);
    setVideoPreview(video.video?.url || null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlaylist) {
      toast.error("Select a playlist first");
      return;
    }

    if (!title.trim() || !shortDescription.trim()) {
      toast.error("Title and short description are required");
      return;
    }

    if (!editingId && !thumbnailFile) {
      toast.error("A thumbnail image is required");
      return;
    }

    if (!editingId && !videoFile) {
      toast.error("A video file is required");
      return;
    }

    const uploadId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const formData = new FormData();
    formData.append("playlistId", selectedPlaylist._id || selectedPlaylist.id);
    formData.append("title", title.trim());
    formData.append("shortDescription", shortDescription.trim());
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
    if (videoFile) formData.append("video", videoFile);
    formData.append("uploadId", uploadId);

    // Combine both legs into one bar, same convention as the regular admin
    // video upload: 0-50% while sending to our server, 50-100% polled from
    // the server while it relays the file to Bunny.
    let bunnyPercent = 0;
    const pollBunnyProgress = videoFile
      ? setInterval(async () => {
          try {
            const { data } = await api.get(
              `/api/admin/private-videos/upload-progress/${uploadId}`,
            );
            bunnyPercent = data?.data?.percent ?? bunnyPercent;
            setProgress((previous) => Math.max(previous, 50 + Math.round(bunnyPercent / 2)));
          } catch {
            // Non-critical — the bar just won't advance this tick.
          }
        }, 400)
      : null;

    try {
      setSubmitting(true);
      setProgress(0);

      const onUploadProgress = (event) => {
        if (!event.total) return;
        const clientPercent = Math.round((event.loaded / event.total) * 100);
        setProgress((previous) =>
          Math.max(previous, videoFile ? Math.round(clientPercent / 2) : clientPercent),
        );
      };

      if (editingId) {
        await api.put(`/api/admin/private-videos/${editingId}`, formData, { onUploadProgress });
        toast.success("Private video updated");
      } else {
        await api.post("/api/admin/private-videos", formData, { onUploadProgress });
        toast.success("Private video uploaded");
      }

      setProgress(100);
      resetForm();
      loadVideos(editingId ? page : 1);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save the video");
    } finally {
      if (pollBunnyProgress) clearInterval(pollBunnyProgress);
      setSubmitting(false);
      setProgress(0);
    }
  };

  const handleDelete = async (video) => {
    const id = video._id || video.id;
    if (!window.confirm(`Delete "${video.title}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/api/admin/private-videos/${id}`);
      if (editingId === id) resetForm();
      loadVideos(page);
      toast.success("Private video deleted");
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
          <VideoIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent">
            Private Video
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload videos into a playlist for assigned private users to watch.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        <h2 className="text-lg font-black text-white">
          {editingId ? "Edit Private Video" : "Add Private Video"}
        </h2>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            1. Select Playlist
          </label>
          <PlaylistPicker
            selectedPlaylist={selectedPlaylist}
            onSelect={setSelectedPlaylist}
            onClear={() => setSelectedPlaylist(null)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Video Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Episode 1"
            className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Short Description
          </label>
          <textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={3}
            placeholder="A brief summary of this video..."
            className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Thumbnail
            </label>
            <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
              <span>
                Recommended <span className="font-bold text-white">1280×720px</span> (16:9).
                Max file size: <span className="font-bold text-white">20MB</span>.
              </span>
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleThumbnailChange}
              className="hidden"
              id="private-video-thumbnail-input"
            />
            <label
              htmlFor="private-video-thumbnail-input"
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
            >
              <ImageUp className="h-4 w-4" />
              {thumbnailFile ? "Change Thumbnail" : "Choose Thumbnail"}
            </label>
            {thumbnailPreview && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-semibold text-slate-400">
                  {thumbnailFile ? "New thumbnail" : "Current thumbnail"}
                </p>
                <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-[#8b5cf6]/20">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="aspect-video w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Video File
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/3gpp"
              onChange={handleVideoChange}
              className="hidden"
              id="private-video-file-input"
            />
            <label
              htmlFor="private-video-file-input"
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
            >
              <UploadCloud className="h-4 w-4" />
              {videoFile ? "Change Video" : "Choose Video"}
            </label>
            {videoFile && (
              <p className="mt-2 truncate text-xs text-slate-400">Selected: {videoFile.name}</p>
            )}
            {videoPreview && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-semibold text-slate-400">
                  {videoFile ? "New video" : "Current video"}
                </p>
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-w-md rounded-2xl border border-[#8b5cf6]/20 bg-black"
                />
              </div>
            )}
          </div>
        </div>

        {submitting && (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-[#8b5cf6]" />
                Uploading...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Uploading..." : editingId ? "Update Video" : "Upload Video"}
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

      <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <h2 className="mb-4 text-lg font-black text-white">
          Private Videos {total > 0 && `(${total})`}
        </h2>

        {loadingVideos ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : videos.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No private videos yet — add one above.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {videos.map((video) => {
              const id = video._id || video.id;

              return (
                <div
                  key={id}
                  className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-[#8b5cf6]/15 bg-black/30 p-2.5"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40">
                    <img
                      src={`${base}${video.thumbnail}`}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <p className="truncate text-xs font-semibold text-white">{video.title}</p>
                  <p className="truncate text-[11px] text-slate-400">
                    {video.playlist?.title || "—"}
                  </p>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(video)}
                      className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-2 py-1.5 text-violet-200 transition hover:bg-[#8b5cf6]/25"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(video)}
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

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <span className="text-sm font-semibold text-slate-300">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateVideoManager;
