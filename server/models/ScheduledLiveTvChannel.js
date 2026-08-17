import mongoose from "mongoose";

import { LIVE_TV_CATEGORY_KEYS } from "./liveTvCategories.js";

// A video the admin uploaded directly (Bunny-hosted) — never a reference
// into the main Video content library, since this system manages its own
// uploads entirely separately.
const uploadedVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileName: { type: String, required: true }, // Bunny object key, needed to delete it later
    originalName: { type: String, default: null }, // for a friendlier admin-UI label
  },
  { _id: false },
);

// One programming slot in the channel's timetable. `date` is a plain
// "YYYY-MM-DD" string for a one-time slot on that exact day, or null for a
// daily-recurring slot that plays at `startTime` every day. A dated slot
// takes priority over a recurring one that would otherwise overlap it (see
// server/utils/liveTvSchedule.js, where this is resolved).
const scheduleEntrySchema = new mongoose.Schema(
  {
    video: { type: uploadedVideoSchema, required: true },
    startTime: { type: String, required: true, trim: true }, // "HH:mm", 24h
    date: { type: String, default: null }, // "YYYY-MM-DD" or null (recurring)
    durationSeconds: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

// A video in the "all time" pool — plays whenever nothing in `schedule`
// matches the current moment. Every entry in the pool plays back-to-back
// in an endless, site-wide-synchronized loop (see resolveAllTimeVideo in
// server/utils/liveTvSchedule.js) rather than there being a single fixed
// "default" video.
const allTimeVideoSchema = new mongoose.Schema(
  {
    video: { type: uploadedVideoSchema, required: true },
    durationSeconds: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

// Pipra-TV — the site's own singleton broadcast channel (there is only ever
// one document in this collection). Fully separate collection from
// LiveTvChannel (the external-stream IPTV system) — different admin page,
// different data shape, no shared fields to keep straight.
const scheduledLiveTvChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    allTimeVideos: { type: [allTimeVideoSchema], default: [] },
    schedule: { type: [scheduleEntrySchema], default: [] },

    logo: { type: String, default: null },
    homeFeatured: { type: Boolean, default: false },
    // Same meaning as on LiveTvChannel — which Live TV page sections this
    // shows up in, and whether it's also in the pinned row at the top.
    categories: {
      type: [{ type: String, enum: LIVE_TV_CATEGORY_KEYS }],
      default: [],
    },
    showOnList: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ScheduledLiveTvChannel = mongoose.model(
  "ScheduledLiveTvChannel",
  scheduledLiveTvChannelSchema,
);

export default ScheduledLiveTvChannel;
