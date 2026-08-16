import mongoose from "mongoose";

const privateVideoSchema = new mongoose.Schema(
  {
    playlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrivateVideoPlaylist",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 150 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 500 },

    thumbnail: { type: String, required: true },

    video: {
      url: { type: String, required: true },
      fileName: { type: String, required: true },
    },
  },
  { timestamps: true },
);

const PrivateVideo = mongoose.model("PrivateVideo", privateVideoSchema);

export default PrivateVideo;
