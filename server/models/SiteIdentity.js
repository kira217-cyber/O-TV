import mongoose from "mongoose";

const siteIdentitySchema = new mongoose.Schema(
  {
    logo: { type: String, default: null },
  },
  { timestamps: true },
);

const SiteIdentity = mongoose.model("SiteIdentity", siteIdentitySchema);

export default SiteIdentity;
