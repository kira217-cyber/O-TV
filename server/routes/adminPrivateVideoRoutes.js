import express from "express";

import PrivateVideo from "../models/PrivateVideo.js";
import PrivateVideoPlaylist from "../models/PrivateVideoPlaylist.js";
import { uploadPrivateVideoFields } from "../config/multerPrivateVideo.js";
import { handleUpload } from "../utils/handleUpload.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { uploadToBunny, deleteFromBunny } from "../config/bunnyStorage.js";
import {
  MAX_THUMBNAIL_SIZE,
  saveThumbnail,
  deleteLocalFile,
  buildBunnyFileName,
} from "../utils/videoFiles.js";
import {
  setUploadProgress,
  getUploadProgress,
  clearUploadProgress,
} from "../utils/uploadProgress.js";

const router = express.Router();
const DEFAULT_PAGE_SIZE = 30;

router.use(protectAdmin);

/* =========================
   List (optionally filtered by ?playlist=<id>) — reused by both the main
   manager list and the "Playlist Videos" browse page.

   Pagination (?page=&limit=) is opt-in: the browse page never sends it and
   keeps getting every video in the selected playlist unpaginated (playlists
   are small), while the main manager list requests it explicitly since it
   spans every playlist and can grow large.
========================= */
router.get("/", async (req, res) => {
  try {
    const { playlist, page: pageQuery, limit: limitQuery } = req.query || {};
    const filter = {};

    if (playlist) filter.playlist = playlist;

    if (!pageQuery && !limitQuery) {
      const videos = await PrivateVideo.find(filter)
        .populate("playlist", "title logo")
        .sort({ createdAt: -1 });

      return successResponse(res, "Private videos loaded", { videos });
    }

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    const limit = Math.max(1, parseInt(limitQuery, 10) || DEFAULT_PAGE_SIZE);

    const [videos, total] = await Promise.all([
      PrivateVideo.find(filter)
        .populate("playlist", "title logo")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PrivateVideo.countDocuments(filter),
    ]);

    return successResponse(res, "Private videos loaded", {
      videos,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Create — upload thumbnail (local disk) + video (Bunny)
========================= */
router.post(
  "/",
  handleUpload(uploadPrivateVideoFields),
  async (req, res) => {
    const files = req.files || {};
    const thumbnailFile = files.thumbnail?.[0];
    const videoFile = files.video?.[0];
    const uploadId = req.body?.uploadId;

    const rollbackActions = [];
    const rollback = async () => {
      for (const action of rollbackActions.reverse()) {
        await action().catch(() => {});
      }
    };

    try {
      const { playlistId, title, shortDescription } = req.body || {};

      if (!playlistId) {
        return errorResponse(res, "A playlist must be selected", 400);
      }

      const playlist = await PrivateVideoPlaylist.findById(playlistId);

      if (!playlist) {
        return errorResponse(res, "Selected playlist not found", 400);
      }

      if (!title?.trim() || !shortDescription?.trim()) {
        return errorResponse(res, "Title and short description are required", 400);
      }

      if (!thumbnailFile) {
        return errorResponse(res, "A thumbnail image is required", 400);
      }

      if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
        return errorResponse(res, "Thumbnail must be 20MB or smaller", 400);
      }

      if (!videoFile) {
        return errorResponse(res, "Video file is required", 400);
      }

      const thumbnailPath = await saveThumbnail(thumbnailFile);
      rollbackActions.push(async () => deleteLocalFile(thumbnailPath));

      const videoFileName = buildBunnyFileName("privatevideo", videoFile.originalname);
      const videoUrl = await uploadToBunny(
        videoFile.buffer,
        videoFileName,
        videoFile.mimetype,
        uploadId ? (percent) => setUploadProgress(uploadId, percent) : undefined,
      );
      rollbackActions.push(async () => deleteFromBunny(videoFileName));

      const video = await PrivateVideo.create({
        playlist: playlist._id,
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        thumbnail: thumbnailPath,
        video: { url: videoUrl, fileName: videoFileName },
      });

      const populated = await video.populate("playlist", "title logo");

      return successResponse(res, "Private video uploaded", { video: populated }, 201);
    } catch (error) {
      await rollback();
      return errorResponse(res, error.message, 500);
    } finally {
      clearUploadProgress(uploadId);
    }
  },
);

/* =========================
   Live Upload Progress (polled while a create/update request is in flight)
========================= */
router.get("/upload-progress/:uploadId", (req, res) => {
  const percent = getUploadProgress(req.params.uploadId);
  return successResponse(res, "Upload progress", { percent: percent ?? 0 });
});

/* =========================
   Update
========================= */
router.put(
  "/:id",
  handleUpload(uploadPrivateVideoFields),
  async (req, res) => {
    const files = req.files || {};
    const thumbnailFile = files.thumbnail?.[0];
    const videoFile = files.video?.[0];
    const uploadId = req.body?.uploadId;

    const rollbackActions = [];
    const rollback = async () => {
      for (const action of rollbackActions.reverse()) {
        await action().catch(() => {});
      }
    };

    let oldThumbnail = null;
    let oldVideoFileName = null;

    try {
      const video = await PrivateVideo.findById(req.params.id);

      if (!video) {
        await rollback();
        return errorResponse(res, "Private video not found", 404);
      }

      const { playlistId, title, shortDescription } = req.body || {};

      if (playlistId) {
        const playlist = await PrivateVideoPlaylist.findById(playlistId);

        if (!playlist) {
          await rollback();
          return errorResponse(res, "Selected playlist not found", 400);
        }

        video.playlist = playlist._id;
      }

      if (thumbnailFile) {
        if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
          await rollback();
          return errorResponse(res, "Thumbnail must be 20MB or smaller", 400);
        }

        const newThumbnailPath = await saveThumbnail(thumbnailFile);
        rollbackActions.push(async () => deleteLocalFile(newThumbnailPath));
        oldThumbnail = video.thumbnail;
        video.thumbnail = newThumbnailPath;
      }

      if (videoFile) {
        const newVideoFileName = buildBunnyFileName("privatevideo", videoFile.originalname);
        const newVideoUrl = await uploadToBunny(
          videoFile.buffer,
          newVideoFileName,
          videoFile.mimetype,
          uploadId ? (percent) => setUploadProgress(uploadId, percent) : undefined,
        );
        rollbackActions.push(async () => deleteFromBunny(newVideoFileName));
        oldVideoFileName = video.video?.fileName;
        video.video = { url: newVideoUrl, fileName: newVideoFileName };
      }

      if (title?.trim()) video.title = title.trim();
      if (shortDescription?.trim()) video.shortDescription = shortDescription.trim();

      await video.save();

      if (oldThumbnail) deleteLocalFile(oldThumbnail);
      if (oldVideoFileName) await deleteFromBunny(oldVideoFileName);

      const populated = await video.populate("playlist", "title logo");

      return successResponse(res, "Private video updated", { video: populated });
    } catch (error) {
      await rollback();
      return errorResponse(res, error.message, 500);
    } finally {
      clearUploadProgress(uploadId);
    }
  },
);

/* =========================
   Delete
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const video = await PrivateVideo.findByIdAndDelete(req.params.id);

    if (!video) {
      return errorResponse(res, "Private video not found", 404);
    }

    deleteLocalFile(video.thumbnail);
    await deleteFromBunny(video.video?.fileName);

    return successResponse(res, "Private video deleted");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
