import mongoose from "mongoose";

export const HOME_SECTION_KEYS = [
  "trending",
  "freeMovie",
  "topTen",
  "allOtt",
  "allChannel",
  "football",
  "liveTv",
  "hollywood",
  "favoriteHero",
  "horror",
];

// Sections whose component renders a full-bleed background image.
export const SECTIONS_WITH_BACKGROUND = ["freeMovie", "football", "hollywood"];

const homeSectionSchema = new mongoose.Schema(
  {
    key: { type: String, enum: HOME_SECTION_KEYS, required: true, unique: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    backgroundDesktop: { type: String, default: null },
    backgroundMobile: { type: String, default: null },
  },
  { timestamps: true },
);

const HomeSection = mongoose.model("HomeSection", homeSectionSchema);

export default HomeSection;
