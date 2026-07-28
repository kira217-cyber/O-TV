import express from "express";

import Video from "../models/Video.js";
import Promotion, { PROMOTABLE_SECTIONS } from "../models/Promotion.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectStudioUser } from "../middleware/protectStudioUser.js";

const router = express.Router();

/* =========================
   List My Promotion Requests
========================= */
router.get("/", protectStudioUser, async (req, res) => {
  try {
    const promotions = await Promotion.find({ studioUser: req.studioUser._id })
      .sort({ createdAt: -1 })
      .populate("video", "title thumbnail duration category status");

    return successResponse(res, "Promotion requests loaded", { promotions });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Request Promotion for one of my active videos
========================= */
router.post("/", protectStudioUser, async (req, res) => {
  try {
    const { videoId, sections, endDate } = req.body || {};

    if (!videoId) {
      return errorResponse(res, "A video must be selected", 400);
    }

    if (
      !Array.isArray(sections) ||
      sections.length === 0 ||
      sections.some((section) => !PROMOTABLE_SECTIONS.includes(section))
    ) {
      return errorResponse(res, "Select at least one valid section", 400);
    }

    if (!endDate || Number.isNaN(new Date(endDate).getTime())) {
      return errorResponse(res, "A valid end date is required", 400);
    }

    const parsedEndDate = new Date(endDate);

    if (parsedEndDate.getTime() <= Date.now()) {
      return errorResponse(res, "End date must be in the future", 400);
    }

    const video = await Video.findOne({
      _id: videoId,
      studioUser: req.studioUser._id,
    });

    if (!video) {
      return errorResponse(res, "Video not found", 404);
    }

    if (video.status !== "active") {
      return errorResponse(
        res,
        "Only approved videos can be requested for promotion",
        400,
      );
    }

    const existingPending = await Promotion.findOne({
      video: video._id,
      status: "pending",
    });

    if (existingPending) {
      return errorResponse(
        res,
        "This video already has a pending promotion request",
        409,
      );
    }

    const promotion = await Promotion.create({
      video: video._id,
      studioUser: req.studioUser._id,
      sections,
      requestedBy: "studio",
      scheduleType: "campaign",
      endDate: parsedEndDate,
      status: "pending",
    });

    return successResponse(
      res,
      "Promotion request submitted and pending admin review",
      { promotion },
      201,
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
