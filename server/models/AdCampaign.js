import mongoose from "mongoose";

// Video targeting and Live TV targeting are independent — a campaign always
// applies to both, each at either "all" or one specific "single" item, so
// e.g. "All Live TV" + "one specific video" can be combined freely.
export const TARGET_SCOPES = ["all", "single"];

export const IMAGE_AD_SECTIONS = [
  "topLeft",
  "topRight",
  "bottomRight",
  "bottomBanner",
];

// Default drag position (percentage of the frame, top-left corner of the
// box) for each section — a sensible starting point close to where the
// old fixed-corner layout used to place it; admin can drag from there.
// bottomBanner always spans full width, so its positionX is unused.
export const IMAGE_AD_DEFAULT_POSITIONS = {
  topLeft: { x: 2, y: 4 },
  topRight: { x: 78, y: 4 },
  bottomRight: { x: 78, y: 22 },
  bottomBanner: { x: 0, y: 85 },
};

// Default drag SIZE (percentage of the frame's width/height) for each
// section — matches what the old fixed-px sizes (200x280, 180x110,
// 180x110, full-width x 70) worked out to on a representative ~960px-wide
// frame, so existing campaigns keep roughly the same look after admin
// starts resizing from here. bottomBanner's width is always 100 (locked).
export const IMAGE_AD_DEFAULT_SIZES = {
  topLeft: { width: 20.83, height: 51.85 },
  topRight: { width: 18.75, height: 20.37 },
  bottomRight: { width: 18.75, height: 20.37 },
  bottomBanner: { width: 100, height: 12.96 },
};

// Percentage size and position are both admin-draggable now (position
// AND size), so a box can never be resized/positioned such that it
// extends past the frame — see MIN_SECTION_SIZE_PERCENT and the position
// clamp in adminAdCampaignRoutes.js, which caps position at
// `100 - <that section's own current width/height>`.
export const MIN_SECTION_SIZE_PERCENT = 3;

const imageSectionSchema = new mongoose.Schema(
  {
    image: { type: String, default: null },
    url: { type: String, default: null },
    positionX: { type: Number, default: 0, min: 0, max: 100 },
    positionY: { type: Number, default: 0, min: 0, max: 100 },
    width: { type: Number, default: 0, min: 0, max: 100 },
    height: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false },
);

const adCampaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["video", "image"], required: true },

    // type === "video"
    video: {
      url: { type: String, default: null },
      fileName: { type: String, default: null },
    },
    skipAfterSeconds: { type: Number, default: 5 },
    clickUrl: { type: String, default: null },

    // type === "image" — each of the 4 fixed positions is independently optional
    imageSections: {
      topLeft: { type: imageSectionSchema, default: () => ({}) },
      topRight: { type: imageSectionSchema, default: () => ({}) },
      bottomRight: { type: imageSectionSchema, default: () => ({}) },
      bottomBanner: { type: imageSectionSchema, default: () => ({}) },
    },
    displayDurationSeconds: { type: Number, default: 10 },

    // Per-campaign rotation timing — each campaign schedules itself
    // independently instead of sharing one site-wide clock, so two
    // campaigns never compete for the same slot at the same instant.
    firstDelaySeconds: { type: Number, default: 30 },
    intervalSeconds: { type: Number, default: 120 },

    videoScope: { type: String, enum: TARGET_SCOPES, default: "all" },
    targetVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },

    liveTvScope: { type: String, enum: TARGET_SCOPES, default: "all" },
    targetLiveTvChannel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveTvChannel",
      default: null,
    },

    scheduleType: {
      type: String,
      enum: ["campaign", "lifetime"],
      default: "campaign",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },

    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const AdCampaign = mongoose.model("AdCampaign", adCampaignSchema);

export default AdCampaign;
