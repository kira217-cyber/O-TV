import express from "express";
import bcrypt from "bcryptjs";

import PrivateUser from "../models/PrivateUser.js";
import PrivateVideoPlaylist from "../models/PrivateVideoPlaylist.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

router.use(protectAdmin);

const publicPrivateUser = (user) => ({
  id: user._id,
  email: user.email,
  phone: user.phone,
  assignedPlaylists: user.assignedPlaylists,
  createdAt: user.createdAt,
});

// De-dupes and drops any ids that don't correspond to a real playlist, so a
// stale/tampered id in the request never gets silently stored.
const sanitizePlaylistIds = async (rawIds) => {
  const ids = Array.isArray(rawIds) ? [...new Set(rawIds.filter(Boolean))] : [];
  if (ids.length === 0) return [];

  const found = await PrivateVideoPlaylist.find({ _id: { $in: ids } }).select("_id");
  const foundIds = new Set(found.map((p) => String(p._id)));

  return ids.filter((id) => foundIds.has(String(id)));
};

router.get("/", async (req, res) => {
  try {
    const users = await PrivateUser.find()
      .select("-password")
      .populate("assignedPlaylists", "title logo")
      .sort({ createdAt: -1 });

    return successResponse(res, "Private users loaded", { users });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, phone, password, assignedPlaylists } = req.body || {};

    if (!email?.trim() || !phone?.trim() || !password) {
      return errorResponse(res, "Email, phone, and password are required", 400);
    }

    if (password.length < 6) {
      return errorResponse(res, "Password must be at least 6 characters", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await PrivateUser.findOne({ email: normalizedEmail });

    if (exists) {
      return errorResponse(res, "Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const playlistIds = await sanitizePlaylistIds(assignedPlaylists);

    const user = await PrivateUser.create({
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      assignedPlaylists: playlistIds,
    });

    const populated = await user.populate("assignedPlaylists", "title logo");

    return successResponse(
      res,
      "Private user created",
      { user: publicPrivateUser(populated) },
      201,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email already registered", 409);
    }
    return errorResponse(res, error.message, 500);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await PrivateUser.findById(req.params.id);

    if (!user) {
      return errorResponse(res, "Private user not found", 404);
    }

    const { email, phone, password, assignedPlaylists } = req.body || {};

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.toLowerCase().trim();

      if (normalizedEmail !== user.email) {
        const exists = await PrivateUser.findOne({ email: normalizedEmail });
        if (exists) {
          return errorResponse(res, "Email already registered", 409);
        }
        user.email = normalizedEmail;
      }
    }

    if (typeof phone === "string" && phone.trim()) user.phone = phone.trim();

    if (typeof assignedPlaylists !== "undefined") {
      user.assignedPlaylists = await sanitizePlaylistIds(assignedPlaylists);
    }

    if (typeof password === "string" && password.trim()) {
      if (password.trim().length < 6) {
        return errorResponse(res, "Password must be at least 6 characters", 400);
      }
      user.password = await bcrypt.hash(password.trim(), 10);
      // Force re-login everywhere the old password/token was in use.
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();

    const populated = await user.populate("assignedPlaylists", "title logo");

    return successResponse(res, "Private user updated", {
      user: publicPrivateUser(populated),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email already registered", 409);
    }
    return errorResponse(res, error.message, 500);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await PrivateUser.findByIdAndDelete(req.params.id);

    if (!user) {
      return errorResponse(res, "Private user not found", 404);
    }

    return successResponse(res, "Private user deleted");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
