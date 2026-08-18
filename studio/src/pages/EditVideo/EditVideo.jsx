import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";

import { api } from "../../api/axios";
import VideoForm from "../../components/VideoForm/VideoForm";
import UploadProgressModal from "../../components/UploadProgressModal/UploadProgressModal";
import { isUploadCancelled, useUploadProgress } from "../../hooks/useUploadProgress";

const EditVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const { upload, start, reportSent, reportStored, complete, fail, cancel, reset } =
    useUploadProgress();

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);

        const { data } = await api.get(`/api/studio/videos/${id}`);
        setVideo(data?.data?.video || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load video");
        navigate("/my-videos");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (formData) => {
    // Same two-phase progress as UploadVideo: 0-50% for the browser->server
    // leg, 50-100% polled from the server for the (often much slower)
    // server->Bunny leg — only relevant when a new video file is attached.
    const uploadId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    formData.append("uploadId", uploadId);

    let bunnyPercent = 0;
    const pollBunnyProgress = setInterval(async () => {
      try {
        const { data } = await api.get(
          `/api/studio/videos/upload-progress/${uploadId}`,
        );
        bunnyPercent = data?.data?.percent ?? bunnyPercent;
        setProgress((previous) => Math.max(previous, 50 + Math.round(bunnyPercent / 2)));
        reportStored(bunnyPercent);
      } catch {
        // Non-critical — the bar just won't advance this tick.
      }
    }, 400);

    try {
      setSubmitting(true);
      setProgress(0);

      // Only worth a modal when a file is actually being sent — a
      // details-only edit finishes before it could even render.
      const videoFile = formData.get("video");
      const trailerFile = formData.get("trailer");
      const sendingFile = videoFile instanceof File || trailerFile instanceof File;

      // The server streams a file straight to storage as it arrives, so it
      // needs the id and exact byte counts before the file part starts — a
      // form field appended after the file would reach it too late.
      const uploadQuery = new URLSearchParams({ uploadId });
      if (videoFile instanceof File) {
        uploadQuery.set("videoBytes", String(videoFile.size));
      }
      if (trailerFile instanceof File) {
        uploadQuery.set("trailerBytes", String(trailerFile.size));
      }

      let signal;

      if (sendingFile) {
        const biggest = videoFile instanceof File ? videoFile : trailerFile;
        signal = start({
          fileName: biggest.name,
          fileSize: biggest.size,
          // One leg, not two: the file reaches storage as it is sent, so the
          // browser's own progress is the whole story.
          storedBytes: 0,
        });
      }

      await api.put(`/api/studio/videos/${id}?${uploadQuery}`, formData, {
        signal,
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress((previous) =>
            Math.max(previous, Math.round((event.loaded / event.total) * 50)),
          );
          reportSent(event.loaded, event.total);
        },
      });

      setProgress(100);

      if (sendingFile) {
        complete();
        await new Promise((resolve) => setTimeout(resolve, 1400));
      }

      toast.success("Video updated and sent back for admin review");
      navigate("/my-videos");
    } catch (error) {
      if (isUploadCancelled(error)) {
        reset();
        toast.info("Upload cancelled");
      } else {
        const message = error?.response?.data?.message || "Failed to update video";
        fail(message);
        toast.error(message);
      }
    } finally {
      clearInterval(pollBunnyProgress);
      setSubmitting(false);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Loading video...
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309] shadow-lg shadow-[#f59e0b]/30">
          <Pencil className="h-6 w-6 text-black" />
        </div>

        <div>
          <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent">
            Edit Video
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Changing any detail will send this video back to admin for
            re-review.
          </p>
        </div>
      </div>

      <VideoForm
        mode="edit"
        submitting={submitting}
        progress={upload.active ? upload.percent : progress}
        onSubmit={handleSubmit}
        initialValues={{
          title: video.title,
          description: video.description,
          duration: video.duration,
          maturityRating: video.maturityRating,
          category: video.category,
          landscapePreview: `${api.defaults.baseURL}${video.thumbnail?.landscape}`,
          portraitPreview: `${api.defaults.baseURL}${video.thumbnail?.portrait}`,
          videoFileLabel: "current video file",
          trailerFileLabel: video.trailer ? "current trailer file" : null,
        }}
      />

      <UploadProgressModal upload={upload} onClose={reset} onCancel={cancel} />
    </div>
  );
};

export default EditVideo;
