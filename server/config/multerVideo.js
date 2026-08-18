import multer from "multer";

import { bunnyStreamStorage } from "./bunnyStreamStorage.js";

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/3gpp",
];

// Video and trailer parts are piped straight through to Bunny as they
// arrive (see bunnyStreamStorage.js); thumbnails still come back as an
// in-memory buffer, exactly as multer.memoryStorage() delivered them.
// Neither kind is ever written to local disk here.
const MAX_VIDEO_SIZE_MB = Number(process.env.BUNNY_MAX_VIDEO_SIZE_MB) || 2048;

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "thumbnailLandscape" || file.fieldname === "thumbnailPortrait") {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Thumbnail must be PNG, JPG, JPEG, WEBP, or GIF"),
        false,
      );
    }
    return cb(null, true);
  }

  if (file.fieldname === "video" || file.fieldname === "trailer") {
    if (!VIDEO_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Video files must be MP4, WEBM, MOV, MKV, or AVI"),
        false,
      );
    }
    return cb(null, true);
  }

  cb(new Error("Unexpected file field"), false);
};

const uploadVideo = multer({
  storage: bunnyStreamStorage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE_MB * 1024 * 1024 },
});

export const uploadVideoFields = uploadVideo.fields([
  { name: "thumbnailLandscape", maxCount: 1 },
  { name: "thumbnailPortrait", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "trailer", maxCount: 1 },
]);

export default uploadVideo;
