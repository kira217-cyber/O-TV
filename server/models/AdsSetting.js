import mongoose from "mongoose";

export const ADS_SLOTS = ["ads1", "ads2"];

const adsSettingSchema = new mongoose.Schema(
  {
    slot: { type: String, enum: ADS_SLOTS, required: true, unique: true },
    image: { type: String, default: null },
    url: { type: String, default: null },
    openInNewTab: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const AdsSetting = mongoose.model("AdsSetting", adsSettingSchema);

export default AdsSetting;
