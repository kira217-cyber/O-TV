import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { UploadCloud } from "lucide-react";

import { api } from "../../api/axios";
import VideoForm from "../../components/VideoForm/VideoForm";

const UploadVideo = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setProgress(0);

      await api.post("/api/studio/videos", formData, {
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      toast.success("Video uploaded successfully and is pending admin review");
      navigate("/my-videos");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload video");
    } finally {
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
            admin before it goes live on O-TV.
          </p>
        </div>
      </div>

      <VideoForm
        mode="create"
        submitting={submitting}
        progress={progress}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default UploadVideo;
