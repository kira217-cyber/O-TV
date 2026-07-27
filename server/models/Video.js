import mongoose from "mongoose";

export const MATURITY_RATING_OPTIONS = ["All Ages", "13+", "16+", "18+"];

export const CATEGORY_OPTIONS = [
  "Action",
  "Romance",
  "Comedy",
  "Drama",
  "Horror",
  "Thriller",
  "Documentary",
  "Educational",
  "Animation",
  "Other",
];

const videoSchema = new mongoose.Schema(
  {
    studioUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudioUser",
      required: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },

    thumbnail: { type: String, required: true },
    duration: { type: String, required: true, trim: true },

    maturityRating: {
      type: String,
      enum: MATURITY_RATING_OPTIONS,
      required: true,
    },

    category: { type: String, enum: CATEGORY_OPTIONS, required: true },

    video: {
      url: { type: String, required: true },
      fileName: { type: String, required: true },
    },

    trailer: {
      url: { type: String, default: null },
      fileName: { type: String, default: null },
    },

    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },

    rejectionReason: { type: String, default: null },
  },
  { timestamps: true },
);

const Video = mongoose.model("Video", videoSchema);

export default Video;
