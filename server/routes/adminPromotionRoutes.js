import express from "express";

import Promotion, { PROMOTABLE_SECTIONS } from "../models/Promotion.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

router.use(protectAdmin);

const STATUS_VALUES = ["pending", "approved", "rejected"];

const POPULATE_FIELDS = [
  { path: "video", select: "title thumbnail duration category status" },
  { path: "studioUser", select: "fullName email phone channel" },
];

/* =========================
   List / Filter Promotions
========================= */
router.get("/", async (req, res) => {
  try {
    const { section, status } = req.query || {};

    const filter = {};

    if (typeof section === "string" && PROMOTABLE_SECTIONS.includes(section)) {
      filter.sections = section;
    }

    if (typeof status === "string" && STATUS_VALUES.includes(status)) {
      filter.status = status;
    }

    const promotions = await Promotion.find(filter)
      .sort({ createdAt: -1 })
      .populate(POPULATE_FIELDS);

    return successResponse(res, "Promotions loaded", { promotions });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Approve / Reject a Promotion Request
========================= */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, rejectionReason } = req.body || {};

    if (status !== "approved" && status !== "rejected") {
      return errorResponse(res, "Status must be 'approved' or 'rejected'", 400);
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
      return errorResponse(res, "A rejection reason is required", 400);
    }

    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return errorResponse(res, "Promotion request not found", 404);
    }

    promotion.status = status;

    if (status === "approved") {
      // The campaign clock starts now, not at submission time, so time
      // spent waiting for review isn't deducted from the studio's window.
      promotion.startDate = new Date();
      promotion.rejectionReason = null;
    } else {
      promotion.rejectionReason = rejectionReason.trim();
    }

    await promotion.save();

    return successResponse(
      res,
      status === "approved" ? "Promotion approved and is now live" : "Promotion rejected",
      { promotion },
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Edit Promotion Schedule
========================= */
router.put("/:id", async (req, res) => {
  try {
    const { scheduleType, endDate } = req.body || {};

    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return errorResponse(res, "Promotion request not found", 404);
    }

    if (scheduleType && !["campaign", "lifetime"].includes(scheduleType)) {
      return errorResponse(res, "Invalid schedule type", 400);
    }

    const nextScheduleType = scheduleType || promotion.scheduleType;

    if (nextScheduleType === "campaign") {
      if (!endDate || Number.isNaN(new Date(endDate).getTime())) {
        return errorResponse(
          res,
          "A valid end date is required for a campaign schedule",
          400,
        );
      }

      promotion.endDate = new Date(endDate);
    } else {
      promotion.endDate = null;
    }

    promotion.scheduleType = nextScheduleType;

    await promotion.save();

    return successResponse(res, "Promotion schedule updated", { promotion });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Remove Promotion (never deletes the underlying video)
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return errorResponse(res, "Promotion request not found", 404);
    }

    return successResponse(res, "Promotion removed from this section");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
