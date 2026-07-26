import express from "express";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

import StudioUser from "../models/StudioUser.js";
import generateToken from "../utils/generateToken.js";
import upload from "../config/multer.js";
import { handleUpload } from "../utils/handleUpload.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectStudioUser } from "../middleware/protectStudioUser.js";

const router = express.Router();

// Mongoose auto-instantiates the nested `channel` sub-schema (as
// { name: null, logo: null }) even when a user never created one, so a
// presence check alone isn't enough — treat it as "no channel yet"
// until a name has actually been saved.
const normalizeChannel = (channel) => (channel?.name ? channel : null);

const publicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  status: user.status,
  channel: normalizeChannel(user.channel),
  createdAt: user.createdAt,
});

const deleteUploadedFile = (relativePath) => {
  if (!relativePath) return;

  const filePath = path.join(process.cwd(), relativePath.replace(/^\//, ""));

  fs.unlink(filePath, () => {
    // Ignore errors — file may already be gone.
  });
};

/* =========================
   Register
========================= */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body || {};

    if (!fullName || !email || !phone || !password) {
      return errorResponse(res, "All fields are required", 400);
    }

    if (password.length < 6) {
      return errorResponse(res, "Password must be at least 6 characters", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    const exists = await StudioUser.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (exists) {
      return errorResponse(
        res,
        exists.email === normalizedEmail
          ? "Email already registered"
          : "Phone number already registered",
        409,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await StudioUser.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
    });

    const token = generateToken(
      { id: user._id, tokenVersion: user.tokenVersion || 0 },
      "1d",
    );

    return successResponse(
      res,
      "Registration successful",
      { token, user: publicUser(user) },
      201,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email or phone already registered", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Login (email or phone)
========================= */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return errorResponse(
        res,
        "Email/phone and password required",
        400,
      );
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    const user = await StudioUser.findOne({
      $or: [
        { email: normalizedIdentifier },
        { phone: identifier.trim() },
      ],
    });

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = generateToken(
      { id: user._id, tokenVersion: user.tokenVersion || 0 },
      "1d",
    );

    return successResponse(res, "Login successful", {
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Get Profile
========================= */
router.get("/profile", protectStudioUser, async (req, res) => {
  return successResponse(res, "Profile loaded", {
    user: publicUser(req.studioUser),
  });
});

/* =========================
   Update Profile
========================= */
router.put("/profile", protectStudioUser, async (req, res) => {
  try {
    const { fullName, email, phone, currentPassword, newPassword } =
      req.body || {};

    const user = await StudioUser.findById(req.studioUser._id);

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

    const wantNameChange =
      typeof fullName === "string" &&
      fullName.trim() &&
      fullName.trim() !== user.fullName;

    if (
      !wantEmailChange &&
      !wantPhoneChange &&
      !wantPasswordChange &&
      !wantNameChange
    ) {
      return errorResponse(res, "Nothing to update", 400);
    }

    if (!currentPassword) {
      return errorResponse(res, "Current password is required", 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

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

    if (wantNameChange) user.fullName = fullName.trim();
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
      // Invalidate every previously issued token, forcing a fresh login
      // on this device and all other logged-in devices.
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();

    return successResponse(res, "Profile updated successfully", {
      user: publicUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email or phone already in use", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Get My Channel
========================= */
router.get("/channel", protectStudioUser, async (req, res) => {
  return successResponse(res, "Channel loaded", {
    channel: normalizeChannel(req.studioUser.channel),
  });
});

/* =========================
   Create / Update My Channel
========================= */
router.put(
  "/channel",
  protectStudioUser,
  handleUpload(upload.single("logo")),
  async (req, res) => {
    try {
      const { name } = req.body || {};

      if (!name || !name.trim()) {
        if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Channel name is required", 400);
      }

      const user = await StudioUser.findById(req.studioUser._id);

      if (!user) {
        if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "User not found", 404);
      }

      const previousLogo = user.channel?.logo;

      user.channel = {
        name: name.trim(),
        logo: req.file ? `/uploads/${req.file.filename}` : previousLogo || null,
      };

      await user.save();

      if (req.file && previousLogo) {
        deleteUploadedFile(previousLogo);
      }

      return successResponse(res, "Channel saved successfully", {
        channel: user.channel,
      });
    } catch (error) {
      if (req.file) deleteUploadedFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
