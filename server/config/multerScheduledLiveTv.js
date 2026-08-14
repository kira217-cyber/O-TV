import multer from "multer";

const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/3gpp",
];

// Buffers in memory (never local disk) since every scheduled-channel video
// is forwarded straight to Bunny storage, same convention as
// config/multerVideo.js and config/multerAds.js.
const MAX_VIDEO_SIZE_MB = Number(process.env.BUNNY_MAX_VIDEO_SIZE_MB) || 2048;

const fileFilter = (req, file, cb) => {
  if (!VIDEO_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Video files must be MP4, WEBM, MOV, MKV, or AVI"), false);
  }
  cb(null, true);
};

const uploadScheduledVideo = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE_MB * 1024 * 1024 },
});

export const uploadScheduledVideoSingle = uploadScheduledVideo.single("video");

export default uploadScheduledVideo;
