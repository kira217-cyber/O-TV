import express from "express";

import Video, {
  MATURITY_RATING_OPTIONS,
  CATEGORY_OPTIONS,
} from "../models/Video.js";
import StudioUser from "../models/StudioUser.js";
import Promotion, { PROMOTABLE_SECTIONS } from "../models/Promotion.js";
import { uploadVideoFields } from "../config/multerVideo.js";
import { handleUpload } from "../utils/handleUpload.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { deleteFromBunny } from "../config/bunnyStorage.js";
import { discardStreamedUploadsOnFailure } from "../config/bunnyStreamStorage.js";
import { storeMediaFile } from "../utils/bunnyUpload.js";
import {
  MAX_THUMBNAIL_SIZE,
  saveThumbnail,
  deleteLocalFile,
} from "../utils/videoFiles.js";
import { publicVideo } from "../utils/videoSerializer.js";
import {
  getUploadProgress,
  clearUploadProgress,
} from "../utils/uploadProgress.js";

const router = express.Router();

const DEFAULT_PAGE_SIZE = 30;
const STATUS_VALUES = ["pending", "active", "rejected"];

/* =========================
   Create Video (admin direct upload — published immediately,
   with an optional auto-approved promotion request)
========================= */
router.post(
  "/",
  protectAdmin,
  handleUpload(uploadVideoFields),
  discardStreamedUploadsOnFailure,
  async (req, res) => {
    const files = req.files || {};
    const landscapeFile = files.thumbnailLandscape?.[0];
    const portraitFile = files.thumbnailPortrait?.[0];
    const videoFile = files.video?.[0];
    const trailerFile = files.trailer?.[0];
    const uploadId = req.query?.uploadId || req.body?.uploadId;

    const rollbackActions = [];
    const rollback = async () => {
      for (const action of rollbackActions.reverse()) {
        await action().catch(() => {});
      }
    };

    try {
      const {
        studioUserId,
        title,
        description,
        duration,
        maturityRating,
        category,
        sections: sectionsRaw,
        scheduleType,
        endDate,
      } = req.body || {};

      if (!studioUserId) {
        return errorResponse(res, "A channel must be selected", 400);
      }

      const studioUser = await StudioUser.findById(studioUserId);

      if (!studioUser) {
        return errorResponse(res, "Selected channel not found", 400);
      }

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

      if (!landscapeFile || !portraitFile) {
        return errorResponse(
          res,
          "Both landscape (16:9) and portrait (9:16) thumbnail images are required",
          400,
        );
      }

      if (landscapeFile.size > MAX_THUMBNAIL_SIZE || portraitFile.size > MAX_THUMBNAIL_SIZE) {
        return errorResponse(res, "Thumbnails must be 20MB or smaller", 400);
      }

      if (!videoFile) {
        return errorResponse(res, "Full video file is required", 400);
      }

      let sections = [];

      if (sectionsRaw) {
        try {
          sections = JSON.parse(sectionsRaw);
        } catch {
          return errorResponse(res, "Invalid sections payload", 400);
        }

        if (
          !Array.isArray(sections) ||
          sections.some((section) => !PROMOTABLE_SECTIONS.includes(section))
        ) {
          return errorResponse(res, "Invalid promotion section selected", 400);
        }
      }

      const wantsPromotion = sections.length > 0;
      const normalizedScheduleType = scheduleType === "lifetime" ? "lifetime" : "campaign";

      if (wantsPromotion && normalizedScheduleType === "campaign") {
        if (!endDate || Number.isNaN(new Date(endDate).getTime())) {
          return errorResponse(res, "A valid end date is required for a campaign schedule", 400);
        }
      }

      const landscapePath = await saveThumbnail(landscapeFile);
      rollbackActions.push(async () => deleteLocalFile(landscapePath));

      const portraitPath = await saveThumbnail(portraitFile);
      rollbackActions.push(async () => deleteLocalFile(portraitPath));

      const { fileName: videoFileName, url: videoUrl } = await storeMediaFile(
        videoFile,
        "video",
        uploadId,
      );
      rollbackActions.push(async () => deleteFromBunny(videoFileName));

      let trailerData = { url: null, fileName: null };

      if (trailerFile) {
        const { fileName: trailerFileName, url: trailerUrl } =
          await storeMediaFile(trailerFile, "trailer");
        rollbackActions.push(async () => deleteFromBunny(trailerFileName));
        trailerData = { url: trailerUrl, fileName: trailerFileName };
      }

      const video = await Video.create({
        studioUser: studioUser._id,
        title: title.trim(),
        description: description?.trim() || "",
        thumbnail: { landscape: landscapePath, portrait: portraitPath },
        duration: duration.trim(),
        maturityRating,
        category,
        video: { url: videoUrl, fileName: videoFileName },
        trailer: trailerData,
        status: "active",
      });

      let promotion = null;

      if (wantsPromotion) {
        promotion = await Promotion.create({
          video: video._id,
          studioUser: studioUser._id,
          sections,
          requestedBy: "admin",
          scheduleType: normalizedScheduleType,
          startDate: new Date(),
          endDate: normalizedScheduleType === "lifetime" ? null : new Date(endDate),
          status: "approved",
        });
      }

      return successResponse(
        res,
        "Video uploaded and published successfully",
        { video: publicVideo(video, { includeOwner: true }), promotion },
        201,
      );
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
router.get("/upload-progress/:uploadId", protectAdmin, (req, res) => {
  const percent = getUploadProgress(req.params.uploadId);
  return successResponse(res, "Upload progress", { percent: percent ?? 0 });
});

/* =========================
   Video Stats (for the admin dashboard)
========================= */
router.get("/stats", protectAdmin, async (req, res) => {
  try {
    const [total, pending, active, rejected, byCategoryAgg] = await Promise.all([
      Video.countDocuments({}),
      Video.countDocuments({ status: "pending" }),
      Video.countDocuments({ status: "active" }),
      Video.countDocuments({ status: "rejected" }),
      Video.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return successResponse(res, "Stats loaded", {
      total,
      pending,
      active,
      rejected,
      byCategory: byCategoryAgg.map((entry) => ({
        category: entry._id,
        count: entry.count,
      })),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

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
  discardStreamedUploadsOnFailure,
  async (req, res) => {
    const files = req.files || {};
    const landscapeFile = files.thumbnailLandscape?.[0];
    const portraitFile = files.thumbnailPortrait?.[0];
    const videoFile = files.video?.[0];
    const trailerFile = files.trailer?.[0];
    const uploadId = req.query?.uploadId || req.body?.uploadId;

    const rollbackActions = [];
    const rollback = async () => {
      for (const action of rollbackActions.reverse()) {
        await action().catch(() => {});
      }
    };

    let oldLandscape = null;
    let oldPortrait = null;
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

      if (typeof video.thumbnail !== "object" || video.thumbnail === null) {
        video.thumbnail = {};
      }

      if (landscapeFile) {
        if (landscapeFile.size > MAX_THUMBNAIL_SIZE) {
          await rollback();
          return errorResponse(res, "Thumbnail must be 20MB or smaller", 400);
        }

        const newLandscapePath = await saveThumbnail(landscapeFile);
        rollbackActions.push(async () => deleteLocalFile(newLandscapePath));
        oldLandscape = video.thumbnail?.landscape;
        video.thumbnail.landscape = newLandscapePath;
      }

      if (portraitFile) {
        if (portraitFile.size > MAX_THUMBNAIL_SIZE) {
          await rollback();
          return errorResponse(res, "Thumbnail must be 20MB or smaller", 400);
        }

        const newPortraitPath = await saveThumbnail(portraitFile);
        rollbackActions.push(async () => deleteLocalFile(newPortraitPath));
        oldPortrait = video.thumbnail?.portrait;
        video.thumbnail.portrait = newPortraitPath;
      }

      if (videoFile) {
        const { fileName: newVideoFileName, url: newVideoUrl } =
          await storeMediaFile(videoFile, "video", uploadId);
        rollbackActions.push(async () => deleteFromBunny(newVideoFileName));
        oldVideoFileName = video.video?.fileName;
        video.video = { url: newVideoUrl, fileName: newVideoFileName };
      }

      if (trailerFile) {
        const { fileName: newTrailerFileName, url: newTrailerUrl } =
          await storeMediaFile(trailerFile, "trailer");
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

      if (oldLandscape) deleteLocalFile(oldLandscape);
      if (oldPortrait) deleteLocalFile(oldPortrait);
      if (oldVideoFileName) await deleteFromBunny(oldVideoFileName);
      if (oldTrailerFileName) await deleteFromBunny(oldTrailerFileName);

      return successResponse(res, "Video updated successfully", {
        video: publicVideo(video, { includeOwner: true }),
      });
    } catch (error) {
      await rollback();
      return errorResponse(res, error.message, 500);
    } finally {
      clearUploadProgress(uploadId);
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

    deleteLocalFile(video.thumbnail?.landscape);
    deleteLocalFile(video.thumbnail?.portrait);
    await deleteFromBunny(video.video?.fileName);
    if (video.trailer?.fileName) await deleteFromBunny(video.trailer.fileName);

    return successResponse(res, "Video deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
