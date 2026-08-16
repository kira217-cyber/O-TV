import multer from "multer";

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/3gpp",
];

// Same memory-storage approach as multerVideo.js — the video bytes are
// forwarded raw to Bunny, never written to local disk.
const MAX_VIDEO_SIZE_MB = Number(process.env.BUNNY_MAX_VIDEO_SIZE_MB) || 2048;

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "thumbnail") {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Thumbnail must be PNG, JPG, JPEG, WEBP, or GIF"),
        false,
      );
    }
    return cb(null, true);
  }

  if (file.fieldname === "video") {
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

const uploadPrivateVideo = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE_MB * 1024 * 1024 },
});

export const uploadPrivateVideoFields = uploadPrivateVideo.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

export default uploadPrivateVideo;
