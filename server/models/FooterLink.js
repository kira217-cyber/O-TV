import mongoose from "mongoose";

const footerLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    image: { type: String, required: true },
    url: { type: String, required: true, trim: true },
    openInNewTab: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const FooterLink = mongoose.model("FooterLink", footerLinkSchema);

export default FooterLink;
