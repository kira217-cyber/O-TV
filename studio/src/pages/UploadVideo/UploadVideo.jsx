import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { UploadCloud } from "lucide-react";

import { api } from "../../api/axios";
import VideoForm from "../../components/VideoForm/VideoForm";
import UploadProgressModal from "../../components/UploadProgressModal/UploadProgressModal";
import { isUploadCancelled, useUploadProgress } from "../../hooks/useUploadProgress";

const UploadVideo = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const { upload, start, reportSent, reportStored, complete, fail, cancel, reset } =
    useUploadProgress();

  const handleSubmit = async (formData) => {
    const videoFile = formData.get("video");
    const trailerFile = formData.get("trailer");

    // The server pipes the file on to Bunny storage while it is still
    // arriving, so there is a single transfer to measure rather than two
    // legs at different speeds. The poll below stays as a fallback for the
    // buffered path the server still supports.
    const uploadId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    formData.append("uploadId", uploadId);

    // The server streams the file straight to storage as it arrives, so it
    // needs the id and the exact byte counts before the file part starts —
    // a form field appended after the file would arrive too late.
    const uploadQuery = new URLSearchParams({ uploadId });
    if (videoFile?.size) uploadQuery.set("videoBytes", String(videoFile.size));
    if (trailerFile?.size) uploadQuery.set("trailerBytes", String(trailerFile.size));

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
      const signal = start({
        fileName: videoFile?.name,
        fileSize: videoFile?.size,
        // One leg, not two: the file reaches storage as it is sent, so the
        // browser's own progress is the whole story.
        storedBytes: 0,
      });

      await api.post(`/api/studio/videos?${uploadQuery}`, formData, {
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
      complete();

      // Hold on the modal's "Upload successful" state for a beat, so the
      // finish is actually seen instead of the page just changing.
      await new Promise((resolve) => setTimeout(resolve, 1400));

      toast.success("Video uploaded successfully and is pending admin review");
      navigate("/my-videos");
    } catch (error) {
      if (isUploadCancelled(error)) {
        reset();
        toast.info("Upload cancelled");
      } else {
        const message = error?.response?.data?.message || "Failed to upload video";
        fail(message);
        toast.error(message);
      }
    } finally {
      clearInterval(pollBunnyProgress);
      setSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309] shadow-lg shadow-[#f59e0b]/30">
          <UploadCloud className="h-6 w-6 text-black" />
        </div>

        <div>
          <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent">
            Upload Video
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Fill in the details below. Your video will be reviewed by an
            admin before it goes live on Pipra-TV.
          </p>
        </div>
      </div>

      <VideoForm
        mode="create"
        submitting={submitting}
        progress={upload.active ? upload.percent : progress}
        onSubmit={handleSubmit}
      />

      <UploadProgressModal upload={upload} onClose={reset} onCancel={cancel} />
    </div>
  );
};

export default UploadVideo;
