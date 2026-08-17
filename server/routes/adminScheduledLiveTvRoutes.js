import express from "express";

import ScheduledLiveTvChannel from "../models/ScheduledLiveTvChannel.js";
import {
  LIVE_TV_CATEGORIES,
  parseLiveTvCategories,
} from "../models/liveTvCategories.js";
import { LIVE_TV_LIST_LIMIT, findFullListCategory } from "../utils/liveTvList.js";

import upload from "../config/multer.js";
import { uploadScheduledVideoSingle } from "../config/multerScheduledLiveTv.js";
import { handleUpload } from "../utils/handleUpload.js";
import { uploadToBunny, deleteFromBunny } from "../config/bunnyStorage.js";
import { deleteLocalFile, buildBunnyFileName } from "../utils/videoFiles.js";
import {
  setUploadProgress,
  getUploadProgress,
  clearUploadProgress,
} from "../utils/uploadProgress.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

router.use(protectAdmin);

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidUploadedVideo = (video) =>
  Boolean(video) &&
  typeof video.url === "string" &&
  video.url.trim() &&
  typeof video.fileName === "string" &&
  video.fileName.trim();

const normalizeUploadedVideo = (video) => ({
  url: video.url,
  fileName: video.fileName,
  originalName: video.originalName || null,
});

// A schedule/all-time-pool video always arrives here as a reference to a
// file already uploaded via POST /upload-video — never a raw file in this
// same request — so this only needs to validate shape, not touch storage.
const parseAndValidateSchedule = (raw) => {
  if (!raw) return { value: [] };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Schedule must be valid JSON" };
  }

  if (!Array.isArray(parsed)) return { error: "Schedule must be a list" };

  for (const entry of parsed) {
    if (!isValidUploadedVideo(entry?.video)) {
      return { error: "Each schedule entry needs an uploaded video" };
    }
    if (!TIME_PATTERN.test(entry.startTime || "")) {
      return { error: `Invalid time "${entry.startTime}" — use HH:mm` };
    }
    if (entry.date && !DATE_PATTERN.test(entry.date)) {
      return { error: `Invalid date "${entry.date}" — use YYYY-MM-DD` };
    }
    if (
      !Number.isFinite(Number(entry.durationSeconds)) ||
      Number(entry.durationSeconds) <= 0
    ) {
      return { error: "Each schedule entry needs a valid video duration" };
    }
  }

  return {
    value: parsed.map((entry) => ({
      video: normalizeUploadedVideo(entry.video),
      startTime: entry.startTime,
      date: entry.date || null,
      durationSeconds: Math.round(Number(entry.durationSeconds)),
    })),
  };
};

// The "all time" pool — plays back-to-back on an endless loop whenever
// nothing in the schedule matches (see resolveAllTimeVideo).
const parseAllTimeVideos = (raw) => {
  if (!raw) return { value: [] };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "All time videos must be valid JSON" };
  }

  if (!Array.isArray(parsed)) return { error: "All time videos must be a list" };

  for (const entry of parsed) {
    if (!isValidUploadedVideo(entry?.video)) {
      return { error: "Each all-time video entry needs an uploaded video" };
    }
    if (
      !Number.isFinite(Number(entry.durationSeconds)) ||
      Number(entry.durationSeconds) <= 0
    ) {
      return { error: "Each all-time video entry needs a valid duration" };
    }
  }

  return {
    value: parsed.map((entry) => ({
      video: normalizeUploadedVideo(entry.video),
      durationSeconds: Math.round(Number(entry.durationSeconds)),
    })),
  };
};

// Every Bunny file this channel currently references — used on update to
// figure out which files became orphaned and should be deleted.
const referencedFileNames = (channel) =>
  new Set(
    [
      ...channel.allTimeVideos.map((e) => e.video?.fileName),
      ...channel.schedule.map((e) => e.video?.fileName),
    ].filter(Boolean),
  );

/* =========================
   Upload a single video — used for each "all time" pool entry and each
   new schedule-entry slot. Uploads straight to Bunny and returns its URL
   so the admin UI can preview it immediately and reference it when the
   channel itself is saved.
========================= */
router.post(
  "/upload-video",
  handleUpload(uploadScheduledVideoSingle),
  async (req, res) => {
    const uploadId = req.body?.uploadId;

    try {
      if (!req.file) return errorResponse(res, "A video file is required", 400);

      const fileName = buildBunnyFileName("live-tv-schedule", req.file.originalname);
      const url = await uploadToBunny(
        req.file.buffer,
        fileName,
        req.file.mimetype,
        uploadId ? (percent) => setUploadProgress(uploadId, percent) : undefined,
      );

      clearUploadProgress(uploadId);

      return successResponse(res, "Video uploaded", {
        video: { url, fileName, originalName: req.file.originalname },
      });
    } catch (error) {
      clearUploadProgress(uploadId);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.get("/upload-progress/:uploadId", (req, res) => {
  const percent = getUploadProgress(req.params.uploadId);
  return successResponse(res, "Upload progress", { percent: percent ?? 0 });
});

/* =========================
   Pipra-TV — the site's own singleton channel. There is only ever one
   document in this collection, so these routes read/upsert/clear it
   directly instead of taking an :id.
========================= */
router.get("/channel", async (req, res) => {
  try {
    const channel = await ScheduledLiveTvChannel.findOne();
    return successResponse(res, "Pipra-TV channel loaded", {
      channel: channel || null,
      categories: LIVE_TV_CATEGORIES,
      listLimit: LIVE_TV_LIST_LIMIT,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/channel",
  handleUpload(upload.single("logo")),
  async (req, res) => {
    try {
      let channel = await ScheduledLiveTvChannel.findOne();
      const {
        name,
        allTimeVideos,
        schedule,
        homeFeatured,
        categories,
        pinned,
        showOnList,
      } = req.body || {};

      // Unlike an external channel, Pipra-TV may legitimately have no
      // category — it always has the pinned row to live in.
      const parsedCategories = parseLiveTvCategories(categories);

      if (typeof categories !== "undefined" && !parsedCategories) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Choose valid categories for this channel", 400);
      }

      if (!channel) {
        if (!name?.trim()) {
          if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
          return errorResponse(res, "Name is required", 400);
        }
        if (!req.file) {
          return errorResponse(res, "A logo image is required", 400);
        }

        channel = new ScheduledLiveTvChannel({ name: name.trim() });
      }

      const previousLogo = channel.logo;
      const previousFileNames = referencedFileNames(channel);

      if (name?.trim()) channel.name = name.trim();

      if (typeof allTimeVideos !== "undefined") {
        const result = parseAllTimeVideos(allTimeVideos);
        if (result.error) {
          if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
          return errorResponse(res, result.error, 400);
        }
        channel.allTimeVideos = result.value;
      }

      if (typeof schedule !== "undefined") {
        const result = parseAndValidateSchedule(schedule);
        if (result.error) {
          if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
          return errorResponse(res, result.error, 400);
        }
        channel.schedule = result.value;
      }

      if (typeof homeFeatured !== "undefined") {
        channel.homeFeatured = homeFeatured === "true" || homeFeatured === true;
      }
      const onList =
        typeof showOnList === "undefined"
          ? channel.showOnList
          : showOnList === "true" || showOnList === true;

      if (onList) {
        const full = await findFullListCategory(
          parsedCategories || channel.categories,
          { scheduled: true },
        );
        if (full) {
          if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
          return errorResponse(
            res,
            `"${full}" already shows ${LIVE_TV_LIST_LIMIT} channels on the Live TV page — remove one first.`,
            400,
          );
        }
      }

      channel.showOnList = onList;

      if (parsedCategories) channel.categories = parsedCategories;
      if (typeof pinned !== "undefined") {
        channel.pinned = pinned === "true" || pinned === true;
      }
      if (req.file) channel.logo = `/uploads/${req.file.filename}`;

      await channel.save();

      if (req.file && previousLogo) deleteLocalFile(previousLogo);

      const currentFileNames = referencedFileNames(channel);
      for (const fileName of previousFileNames) {
        if (!currentFileNames.has(fileName)) deleteFromBunny(fileName).catch(() => {});
      }

      return successResponse(res, "Pipra-TV channel saved", { channel });
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete("/channel", async (req, res) => {
  try {
    const channel = await ScheduledLiveTvChannel.findOneAndDelete();

    if (!channel) return errorResponse(res, "Pipra-TV channel not found", 404);

    deleteLocalFile(channel.logo);
    for (const fileName of referencedFileNames(channel)) {
      deleteFromBunny(fileName).catch(() => {});
    }

    return successResponse(res, "Pipra-TV channel reset");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
