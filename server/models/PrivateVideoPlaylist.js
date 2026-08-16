import mongoose from "mongoose";

const privateVideoPlaylistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    logo: { type: String, required: true },
  },
  { timestamps: true },
);

const PrivateVideoPlaylist = mongoose.model(
  "PrivateVideoPlaylist",
  privateVideoPlaylistSchema,
);

export default PrivateVideoPlaylist;
