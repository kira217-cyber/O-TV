import mongoose from "mongoose";

import { LIVE_TV_CATEGORY_KEYS } from "./liveTvCategories.js";

const liveTvChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    streamUrl: { type: String, required: true, trim: true },
    logo: { type: String, default: null },
    homeFeatured: { type: Boolean, default: false },
    // Which sections of the client's Live TV page this channel appears in.
    // A channel can belong to several at once (Somoy News sits in both
    // "বাংলাদেশি চ্যানেল" and "News Channels", for instance). Empty rather
    // than required so channels added before categories existed keep
    // working — those land in "Other Channels" until an admin edits them.
    categories: {
      type: [{ type: String, enum: LIVE_TV_CATEGORY_KEYS }],
      default: [],
    },
    // Whether this channel is one of the handful shown directly in its
    // category's row on the Live TV page. Every other channel in the
    // category is still reachable through that row's "View All" page —
    // this only picks which ones get the shortcut. Capped per category
    // (see LIVE_TV_LIST_LIMIT) so a row stays a row.
    showOnList: { type: Boolean, default: false },
    // Also listed in the "Pinned Channels" row at the very top of the
    // Live TV page, above every category section.
    pinned: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const LiveTvChannel = mongoose.model("LiveTvChannel", liveTvChannelSchema);

export default LiveTvChannel;
