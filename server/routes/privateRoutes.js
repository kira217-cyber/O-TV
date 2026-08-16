import express from "express";
import bcrypt from "bcryptjs";

import PrivateUser from "../models/PrivateUser.js";
import PrivateVideo from "../models/PrivateVideo.js";
import generateToken from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectPrivateUser } from "../middleware/protectPrivateUser.js";

const router = express.Router();

const publicPrivateUser = (user) => ({
  id: user._id,
  email: user.email,
  phone: user.phone,
  assignedPlaylists: user.assignedPlaylists,
});

/* =========================
   Login (email or phone) — accounts are admin-created only, no self-signup.
========================= */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return errorResponse(res, "Email/phone and password required", 400);
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    const user = await PrivateUser.findOne({
      $or: [{ email: normalizedIdentifier }, { phone: identifier.trim() }],
    }).populate("assignedPlaylists", "title logo");

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = generateToken(
      { id: user._id, tokenVersion: user.tokenVersion || 0 },
      "7d",
    );

    return successResponse(res, "Login successful", {
      token,
      user: publicPrivateUser(user),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Profile (used to rehydrate session on page refresh)
========================= */
router.get("/profile", protectPrivateUser, async (req, res) => {
  const populated = await req.privateUser.populate("assignedPlaylists", "title logo");
  return successResponse(res, "Profile loaded", { user: publicPrivateUser(populated) });
});

/* =========================
   Playlists assigned to the logged-in private user
========================= */
router.get("/playlists", protectPrivateUser, async (req, res) => {
  const populated = await req.privateUser.populate("assignedPlaylists", "title logo");
  return successResponse(res, "Playlists loaded", {
    playlists: populated.assignedPlaylists,
  });
});

/* =========================
   Videos in a playlist — 403s server-side if the playlist isn't assigned
   to this user, regardless of what the client-side UI shows/hides.
========================= */
router.get("/playlists/:id/videos", protectPrivateUser, async (req, res) => {
  try {
    const isAssigned = req.privateUser.assignedPlaylists.some(
      (playlistId) => String(playlistId) === String(req.params.id),
    );

    if (!isAssigned) {
      return errorResponse(res, "You are not assigned to this playlist", 403);
    }

    const videos = await PrivateVideo.find({ playlist: req.params.id })
      .select("title shortDescription thumbnail video createdAt")
      .sort({ createdAt: 1 });

    return successResponse(res, "Videos loaded", { videos });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
