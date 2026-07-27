// Imported first (as a side effect) in index.js so process.env is fully
// populated before any other module's top-level code runs. ES module
// imports are evaluated depth-first in source order, so this must stay
// the very first import in index.js — modules like multerVideo.js read
// env vars (e.g. BUNNY_MAX_VIDEO_SIZE_MB) at construction time and would
// silently see undefined otherwise.
import dotenv from "dotenv";

dotenv.config();
