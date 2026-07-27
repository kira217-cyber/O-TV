import express from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

import StudioUser from "../models/StudioUser.js";
import upload from "../config/multer.js";
import { handleUpload } from "../utils/handleUpload.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

const DEFAULT_PAGE_SIZE = 30;

const deleteUploadedFile = (relativePath) => {
  if (!relativePath) return;

  const filePath = path.join(process.cwd(), relativePath.replace(/^\//, ""));

  fs.unlink(filePath, () => {
    // Ignore errors — file may already be gone.
  });
};

/* =========================
   User Stats (for the admin dashboard)
========================= */
router.get("/stats", protectAdmin, async (req, res) => {
  try {
    const total = await StudioUser.countDocuments({});

    const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayStarts = Array.from({ length: 7 }, (_, index) => {
      const start = new Date(today);
      start.setDate(start.getDate() - (6 - index));
      return start;
    });

    const weeklySignups = await Promise.all(
      dayStarts.map(async (start) => {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const count = await StudioUser.countDocuments({
          createdAt: { $gte: start, $lt: end },
        });

        return { label: WEEKDAY_LABELS[start.getDay()], value: count };
      }),
    );

    return successResponse(res, "Stats loaded", { total, weeklySignups });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   List / Search Users (paginated)
========================= */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const { search, page: pageQuery, limit: limitQuery } = req.query || {};

    const filter = {};

    if (typeof search === "string" && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    }

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    const limit = Math.max(1, parseInt(limitQuery, 10) || DEFAULT_PAGE_SIZE);

    const [users, total] = await Promise.all([
      StudioUser.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      StudioUser.countDocuments(filter),
    ]);

    return successResponse(res, "Users loaded successfully", {
      users,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Get Single User
========================= */
router.get("/:id", protectAdmin, async (req, res) => {
  try {
    const user = await StudioUser.findById(req.params.id).select("-password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User loaded successfully", { user });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Update User (admin)
========================= */
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const { fullName, email, phone, newPassword } = req.body || {};

    const user = await StudioUser.findById(req.params.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const normalizedNewEmail =
      typeof email === "string" && email.trim()
        ? email.toLowerCase().trim()
        : user.email;

    const normalizedNewPhone =
      typeof phone === "string" && phone.trim() ? phone.trim() : user.phone;

    const wantEmailChange = normalizedNewEmail !== user.email;
    const wantPhoneChange = normalizedNewPhone !== user.phone;

    const wantPasswordChange =
      typeof newPassword === "string" && newPassword.trim().length > 0;

    if (wantEmailChange || wantPhoneChange) {
      const exists = await StudioUser.findOne({
        $or: [{ email: normalizedNewEmail }, { phone: normalizedNewPhone }],
      });

      if (exists && String(exists._id) !== String(user._id)) {
        return errorResponse(
          res,
          "Email or phone already in use by another account",
          409,
        );
      }
    }

    if (typeof fullName === "string" && fullName.trim()) {
      user.fullName = fullName.trim();
    }

    if (wantEmailChange) user.email = normalizedNewEmail;
    if (wantPhoneChange) user.phone = normalizedNewPhone;

    if (wantPasswordChange) {
      if (newPassword.trim().length < 6) {
        return errorResponse(
          res,
          "New password must be at least 6 characters",
          400,
        );
      }

      user.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    if (wantEmailChange || wantPhoneChange || wantPasswordChange) {
      // Credentials changed by an admin — sign the user out everywhere.
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();

    const { password, ...safeUser } = user.toObject();

    return successResponse(res, "User updated successfully", {
      user: safeUser,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email or phone already in use", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Activate / Deactivate User (admin only)
========================= */
router.patch("/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};

    if (status !== "active" && status !== "inactive") {
      return errorResponse(res, "Status must be 'active' or 'inactive'", 400);
    }

    const user = await StudioUser.findById(req.params.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (user.status !== status) {
      user.status = status;
      // Force the user out of every device on either transition, since
      // their access level just changed.
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await user.save();
    }

    const { password, ...safeUser } = user.toObject();

    return successResponse(res, `User ${status === "active" ? "activated" : "deactivated"} successfully`, {
      user: safeUser,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Update a User's Channel (admin)
========================= */
router.put(
  "/:id/channel",
  protectAdmin,
  handleUpload(upload.single("logo")),
  async (req, res) => {
    try {
      const { name } = req.body || {};

      const user = await StudioUser.findById(req.params.id);

      if (!user) {
        if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "User not found", 404);
      }

      if (!user.channel?.name && !name?.trim() && !req.file) {
        return errorResponse(res, "Channel name is required", 400);
      }

      const previousLogo = user.channel?.logo;

      user.channel = {
        name: typeof name === "string" && name.trim() ? name.trim() : user.channel?.name,
        logo: req.file ? `/uploads/${req.file.filename}` : previousLogo || null,
      };

      await user.save();

      if (req.file && previousLogo) {
        deleteUploadedFile(previousLogo);
      }

      return successResponse(res, "Channel updated successfully", {
        channel: user.channel,
      });
    } catch (error) {
      if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
