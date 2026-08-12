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

const imageSectionSchema = new mongoose.Schema(
  {
    image: { type: String, default: null },
    url: { type: String, default: null },
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
