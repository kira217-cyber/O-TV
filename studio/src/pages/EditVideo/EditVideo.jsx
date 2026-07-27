import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";

import { api } from "../../api/axios";
import VideoForm from "../../components/VideoForm/VideoForm";

const EditVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

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
    try {
      setSubmitting(true);
      setProgress(0);

      await api.put(`/api/studio/videos/${id}`, formData, {
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      toast.success("Video updated and sent back for admin review");
      navigate("/my-videos");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update video");
    } finally {
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
    <div className="mx-auto max-w-2xl text-white">
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
        progress={progress}
        onSubmit={handleSubmit}
        initialValues={{
          title: video.title,
          description: video.description,
          duration: video.duration,
          maturityRating: video.maturityRating,
          category: video.category,
          thumbnailPreview: `${api.defaults.baseURL}${video.thumbnail}`,
          videoFileLabel: "current video file",
          trailerFileLabel: video.trailer ? "current trailer file" : null,
        }}
      />
    </div>
  );
};

export default EditVideo;
