import mongoose from "mongoose";

const siteIdentitySchema = new mongoose.Schema(
  {
    logo: { type: String, default: null },
    favicon: { type: String, default: null },
    socialLinks: {
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
      telegram: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

const SiteIdentity = mongoose.model("SiteIdentity", siteIdentitySchema);

export default SiteIdentity;
