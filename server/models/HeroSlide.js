import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "", maxlength: 80 },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const HeroSlide = mongoose.model("HeroSlide", heroSlideSchema);

export default HeroSlide;
