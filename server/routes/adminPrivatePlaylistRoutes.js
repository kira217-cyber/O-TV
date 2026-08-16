import express from "express";

import PrivateVideoPlaylist from "../models/PrivateVideoPlaylist.js";
import PrivateVideo from "../models/PrivateVideo.js";
import PrivateUser from "../models/PrivateUser.js";
import upload from "../config/multer.js";
import { handleUpload } from "../utils/handleUpload.js";
import { deleteLocalFile } from "../utils/videoFiles.js";
import { deleteFromBunny } from "../config/bunnyStorage.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

router.use(protectAdmin);

router.get("/", async (req, res) => {
  try {
    const playlists = await PrivateVideoPlaylist.find().sort({ createdAt: -1 });
    return successResponse(res, "Private video playlists loaded", { playlists });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/",
  handleUpload(upload.single("logo")),
  async (req, res) => {
    try {
      const { title } = req.body || {};

      if (!title?.trim()) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Title is required", 400);
      }

      if (!req.file) {
        return errorResponse(res, "A logo image is required", 400);
      }

      const playlist = await PrivateVideoPlaylist.create({
        title: title.trim(),
        logo: `/uploads/${req.file.filename}`,
      });

      return successResponse(res, "Playlist created", { playlist }, 201);
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/:id",
  handleUpload(upload.single("logo")),
  async (req, res) => {
    try {
      const playlist = await PrivateVideoPlaylist.findById(req.params.id);

      if (!playlist) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Playlist not found", 404);
      }

      const { title } = req.body || {};
      const previousLogo = playlist.logo;

      if (title?.trim()) playlist.title = title.trim();
      if (req.file) playlist.logo = `/uploads/${req.file.filename}`;

      await playlist.save();

      if (req.file && previousLogo) deleteLocalFile(previousLogo);

      return successResponse(res, "Playlist updated", { playlist });
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

// Deleting a playlist cascades: every video inside it is removed (Bunny +
// local thumbnail cleanup), and it's pulled out of every private user's
// assignedPlaylists so no one is left referencing a playlist that no
// longer exists.
router.delete("/:id", async (req, res) => {
  try {
    const playlist = await PrivateVideoPlaylist.findByIdAndDelete(req.params.id);

    if (!playlist) return errorResponse(res, "Playlist not found", 404);

    const videos = await PrivateVideo.find({ playlist: playlist._id });

    await Promise.all(
      videos.map(async (video) => {
        deleteLocalFile(video.thumbnail);
        await deleteFromBunny(video.video?.fileName);
      }),
    );

    await PrivateVideo.deleteMany({ playlist: playlist._id });
    await PrivateUser.updateMany(
      { assignedPlaylists: playlist._id },
      { $pull: { assignedPlaylists: playlist._id } },
    );

    deleteLocalFile(playlist.logo);

    return successResponse(res, "Playlist deleted");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
