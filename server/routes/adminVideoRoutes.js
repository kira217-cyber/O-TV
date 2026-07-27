import express from "express";

import Video, {
  MATURITY_RATING_OPTIONS,
  CATEGORY_OPTIONS,
} from "../models/Video.js";
import { uploadVideoFields } from "../config/multerVideo.js";
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
import { publicVideo } from "../utils/videoSerializer.js";

const router = express.Router();

const DEFAULT_PAGE_SIZE = 30;
const STATUS_VALUES = ["pending", "active", "rejected"];

/* =========================
   List / Search / Filter Videos (paginated)
========================= */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const { status, search, page: pageQuery, limit: limitQuery } =
      req.query || {};

    const filter = {};

    if (typeof status === "string" && STATUS_VALUES.includes(status)) {
      filter.status = status;
    }

    if (typeof search === "string" && search.trim()) {
      filter.title = new RegExp(search.trim(), "i");
    }

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    const limit = Math.max(1, parseInt(limitQuery, 10) || DEFAULT_PAGE_SIZE);

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .populate("studioUser", "fullName email phone channel")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Video.countDocuments(filter),
    ]);

    return successResponse(res, "Videos loaded", {
      videos: videos.map((video) => publicVideo(video, { includeOwner: true })),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Get Single Video
========================= */
router.get("/:id", protectAdmin, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "studioUser",
      "fullName email phone channel",
    );

    if (!video) {
      return errorResponse(res, "Video not found", 404);
    }

    return successResponse(res, "Video loaded", {
      video: publicVideo(video, { includeOwner: true }),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Approve / Reject Video
========================= */
router.patch("/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body || {};

    if (status !== "active" && status !== "rejected") {
      return errorResponse(res, "Status must be 'active' or 'rejected'", 400);
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
      return errorResponse(res, "A rejection reason is required", 400);
    }

    const video = await Video.findById(req.params.id);

    if (!video) {
      return errorResponse(res, "Video not found", 404);
    }

    video.status = status;
    video.rejectionReason = status === "rejected" ? rejectionReason.trim() : null;

    await video.save();

    return successResponse(
      res,
      status === "active" ? "Video approved and is now live" : "Video rejected",
      { video: publicVideo(video) },
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Update Video (admin edit — status untouched)
========================= */
router.put(
  "/:id",
  protectAdmin,
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
      const video = await Video.findById(req.params.id);

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

      await video.save();

      if (oldThumbnail) deleteLocalFile(oldThumbnail);
      if (oldVideoFileName) await deleteFromBunny(oldVideoFileName);
      if (oldTrailerFileName) await deleteFromBunny(oldTrailerFileName);

      return successResponse(res, "Video updated successfully", {
        video: publicVideo(video, { includeOwner: true }),
      });
    } catch (error) {
      await rollback();
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   Delete Video (admin)
========================= */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

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
