import mongoose from "mongoose";

export const PROMOTABLE_SECTIONS = [
  "slider",
  "trending",
  "freeMovie",
  "topTen",
  "allOtt",
  "football",
  "hollywood",
  "horror",
];

const promotionSchema = new mongoose.Schema(
  {
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    studioUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudioUser",
      required: true,
    },

    sections: {
      type: [String],
      enum: PROMOTABLE_SECTIONS,
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one section is required",
      },
    },

    requestedBy: { type: String, enum: ["studio", "admin"], required: true },
    scheduleType: {
      type: String,
      enum: ["campaign", "lifetime"],
      default: "campaign",
    },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true },
);

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
