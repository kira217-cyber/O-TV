import mongoose from "mongoose";

const studioUserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

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
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    channel: {
      name: {
        type: String,
        trim: true,
        default: null,
      },
      logo: {
        type: String,
        default: null,
      },
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const StudioUser = mongoose.model("StudioUser", studioUserSchema);

export default StudioUser;
