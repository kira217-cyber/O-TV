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

const IMAGE_SECTION_FIELDS = [
  "topLeftImage",
  "topRightImage",
  "bottomRightImage",
  "bottomBannerImage",
];

// Ad videos need to be forwarded to Bunny as raw bytes, so this buffers in
// memory instead of writing to local disk like the image-only multer config.
const MAX_VIDEO_SIZE_MB = Number(process.env.BUNNY_MAX_VIDEO_SIZE_MB) || 2048;

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "adVideo") {
    if (!VIDEO_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Ad video must be MP4, WEBM, MOV, MKV, or AVI"),
        false,
      );
    }
    return cb(null, true);
  }

  if (IMAGE_SECTION_FIELDS.includes(file.fieldname)) {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Section image must be PNG, JPG, JPEG, WEBP, or GIF"),
        false,
      );
    }
    return cb(null, true);
  }

  cb(new Error("Unexpected file field"), false);
};

const uploadAds = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE_MB * 1024 * 1024 },
});

export const uploadAdFields = uploadAds.fields([
  { name: "adVideo", maxCount: 1 },
  { name: "topLeftImage", maxCount: 1 },
  { name: "topRightImage", maxCount: 1 },
  { name: "bottomRightImage", maxCount: 1 },
  { name: "bottomBannerImage", maxCount: 1 },
]);

export default uploadAds;
