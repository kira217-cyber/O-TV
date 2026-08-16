import mongoose from "mongoose";

const privateUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    assignedPlaylists: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PrivateVideoPlaylist",
        },
      ],
      default: [],
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const PrivateUser = mongoose.model("PrivateUser", privateUserSchema);

export default PrivateUser;
