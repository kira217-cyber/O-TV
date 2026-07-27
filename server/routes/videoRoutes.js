import express from "express";

import Video, {
  MATURITY_RATING_OPTIONS,
  CATEGORY_OPTIONS,
} from "../models/Video.js";
import { uploadVideoFields } from "../config/multerVideo.js";
import { handleUpload } from "../utils/handleUpload.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectStudioUser } from "../middleware/protectStudioUser.js";
import { uploadToBunny, deleteFromBunny } from "../config/bunnyStorage.js";
import {
  MAX_THUMBNAIL_SIZE,
  saveThumbnail,
  deleteLocalFile,
  buildBunnyFileName,
} from "../utils/videoFiles.js";
import { publicVideo } from "../utils/videoSerializer.js";

const router = express.Router();

/* =========================
   Create Video (upload -> pending review)
========================= */
router.post(
  "/",
  protectStudioUser,
  handleUpload(uploadVideoFields),
  async (req, res) => {
    const files = req.files || {};
    const thumbnailFile = files.thumbnail?.[0];
    const videoFile = files.video?.[0];
    const trailerFile = files.trailer?.[0];

    const rollbackActions = [];
    const rollback = async () => {
      for (const action of rollbackActions.reverse()) {
        await action().catch(() => {});
      }
    };

    try {
      const { title, description, duration, maturityRating, category } =
        req.body || {};

      if (!title?.trim() || !duration?.trim() || !maturityRating || !category) {
        return errorResponse(
          res,
          "Title, duration, maturity rating, and category are required",
          400,
        );
      }

      if (!MATURITY_RATING_OPTIONS.includes(maturityRating)) {
        return errorResponse(res, "Invalid maturity rating", 400);
      }

      if (!CATEGORY_OPTIONS.includes(category)) {
        return errorResponse(res, "Invalid category", 400);
      }

      if (!thumbnailFile) {
        return errorResponse(res, "Thumbnail image is required", 400);
      }

      if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
        return errorResponse(res, "Thumbnail must be 20MB or smaller", 400);
      }

      if (!videoFile) {
        return errorResponse(res, "Full video file is required", 400);
      }

      const thumbnailPath = await saveThumbnail(thumbnailFile);
      rollbackActions.push(async () => deleteLocalFile(thumbnailPath));

      const videoFileName = buildBunnyFileName("video", videoFile.originalname);
      const videoUrl = await uploadToBunny(
        videoFile.buffer,
        videoFileName,
        videoFile.mimetype,
      );
      rollbackActions.push(async () => deleteFromBunny(videoFileName));

      let trailerData = { url: null, fileName: null };

      if (trailerFile) {
        const trailerFileName = buildBunnyFileName(
          "trailer",
          trailerFile.originalname,
        );
        const trailerUrl = await uploadToBunny(
          trailerFile.buffer,
          trailerFileName,
          trailerFile.mimetype,
        );
        rollbackActions.push(async () => deleteFromBunny(trailerFileName));
        trailerData = { url: trailerUrl, fileName: trailerFileName };
      }

      const video = await Video.create({
        studioUser: req.studioUser._id,
        title: title.trim(),
        description: description?.trim() || "",
        thumbnail: thumbnailPath,
        duration: duration.trim(),
        maturityRating,
        category,
        video: { url: videoUrl, fileName: videoFileName },
        trailer: trailerData,
        status: "pending",
      });

      return successResponse(
        res,
        "Video uploaded successfully and is pending admin review",
        { video: publicVideo(video) },
        201,
      );
    } catch (error) {
      await rollback();
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   List My Videos
========================= */
router.get("/", protectStudioUser, async (req, res) => {
  try {
    const videos = await Video.find({ studioUser: req.studioUser._id }).sort({
      createdAt: -1,
    });

    return successResponse(res, "Videos loaded", {
      videos: videos.map((video) => publicVideo(video)),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Get One of My Videos
========================= */
router.get("/:id", protectStudioUser, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      studioUser: req.studioUser._id,
    });

    if (!video) {
      return errorResponse(res, "Video not found", 404);
    }

    return successResponse(res, "Video loaded", { video: publicVideo(video) });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Update My Video (edits go back to pending review)
========================= */
router.put(
  "/:id",
  protectStudioUser,
  handleUpload(uploadVideoFields),
  async (req, res) => {
    const files = req.files || {};
    const thumbnailFile = files.thumbnail?.[0];
    const videoFile = files.video?.[0];
    const trailerFile = files.trailer?.[0];

    const rollbackActions = [];
    const rollback = async () => {
      for (const action of rollbackActions.reverse()) {
        await action().catch(() => {});
      }
    };

    let oldThumbnail = null;
    let oldVideoFileName = null;
    let oldTrailerFileName = null;

    try {
      const video = await Video.findOne({
        _id: req.params.id,
        studioUser: req.studioUser._id,
      });

      if (!video) {
        await rollback();
        return errorResponse(res, "Video not found", 404);
      }

      const { title, description, duration, maturityRating, category } =
        req.body || {};

      if (maturityRating && !MATURITY_RATING_OPTIONS.includes(maturityRating)) {
        await rollback();
        return errorResponse(res, "Invalid maturity rating", 400);
      }

      if (category && !CATEGORY_OPTIONS.includes(category)) {
        await rollback();
        return errorResponse(res, "Invalid category", 400);
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
        const newVideoFileName = buildBunnyFileName(
          "video",
          videoFile.originalname,
        );
        const newVideoUrl = await uploadToBunny(
          videoFile.buffer,
          newVideoFileName,
          videoFile.mimetype,
        );
        rollbackActions.push(async () => deleteFromBunny(newVideoFileName));
        oldVideoFileName = video.video?.fileName;
        video.video = { url: newVideoUrl, fileName: newVideoFileName };
      }

      if (trailerFile) {
        const newTrailerFileName = buildBunnyFileName(
          "trailer",
          trailerFile.originalname,
        );
        const newTrailerUrl = await uploadToBunny(
          trailerFile.buffer,
          newTrailerFileName,
          trailerFile.mimetype,
        );
        rollbackActions.push(async () => deleteFromBunny(newTrailerFileName));
        oldTrailerFileName = video.trailer?.fileName;
        video.trailer = { url: newTrailerUrl, fileName: newTrailerFileName };
      }

      if (title?.trim()) video.title = title.trim();
      if (typeof description === "string") video.description = description.trim();
      if (duration?.trim()) video.duration = duration.trim();
      if (maturityRating) video.maturityRating = maturityRating;
      if (category) video.category = category;

      // The creator changed something — send it back through review rather
      // than letting an edited video stay silently approved.
      video.status = "pending";
      video.rejectionReason = null;

      await video.save();

      if (oldThumbnail) deleteLocalFile(oldThumbnail);
      if (oldVideoFileName) await deleteFromBunny(oldVideoFileName);
      if (oldTrailerFileName) await deleteFromBunny(oldTrailerFileName);

      return successResponse(
        res,
        "Video updated and sent back for admin review",
        { video: publicVideo(video) },
      );
    } catch (error) {
      await rollback();
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   Delete My Video
========================= */
router.delete("/:id", protectStudioUser, async (req, res) => {
  try {
    const video = await Video.findOneAndDelete({
      _id: req.params.id,
      studioUser: req.studioUser._id,
    });

    if (!video) {
      return errorResponse(res, "Video not found", 404);
    }

    deleteLocalFile(video.thumbnail);
    await deleteFromBunny(video.video?.fileName);
    if (video.trailer?.fileName) await deleteFromBunny(video.trailer.fileName);

    return successResponse(res, "Video deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
