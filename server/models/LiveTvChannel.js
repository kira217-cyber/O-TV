import mongoose from "mongoose";

const liveTvChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    streamUrl: { type: String, required: true, trim: true },
    logo: { type: String, default: null },
    homeFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const LiveTvChannel = mongoose.model("LiveTvChannel", liveTvChannelSchema);

export default LiveTvChannel;
