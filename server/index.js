import "./config/env.js";

import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import studioRoutes from "./routes/studioRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import adminVideoRoutes from "./routes/adminVideoRoutes.js";
import adminSiteRoutes from "./routes/adminSiteRoutes.js";
import publicSiteRoutes from "./routes/publicSiteRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import adminPromotionRoutes from "./routes/adminPromotionRoutes.js";
import adminAdCampaignRoutes from "./routes/adminAdCampaignRoutes.js";
import adminScheduledLiveTvRoutes from "./routes/adminScheduledLiveTvRoutes.js";
import adminPrivatePlaylistRoutes from "./routes/adminPrivatePlaylistRoutes.js";
import adminPrivateVideoRoutes from "./routes/adminPrivateVideoRoutes.js";
import adminPrivateUserRoutes from "./routes/adminPrivateUserRoutes.js";
import privateRoutes from "./routes/privateRoutes.js";
import { attachAnalyticsSocket } from "./sockets/analyticsSocket.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Pipra-TV server is running");
});

app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/videos", adminVideoRoutes);
app.use("/api/studio", studioRoutes);
app.use("/api/studio/videos", videoRoutes);
app.use("/api/admin/site", adminSiteRoutes);
app.use("/api/site", publicSiteRoutes);
app.use("/api/studio/promotions", promotionRoutes);
app.use("/api/admin/promotions", adminPromotionRoutes);
app.use("/api/admin/ad-campaigns", adminAdCampaignRoutes);
app.use("/api/admin/scheduled-live-tv", adminScheduledLiveTvRoutes);
app.use("/api/admin/private-playlists", adminPrivatePlaylistRoutes);
app.use("/api/admin/private-videos", adminPrivateVideoRoutes);
app.use("/api/admin/private-users", adminPrivateUserRoutes);
app.use("/api/private", privateRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

attachAnalyticsSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
