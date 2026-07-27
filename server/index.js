import "./config/env.js";

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import studioRoutes from "./routes/studioRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import adminVideoRoutes from "./routes/adminVideoRoutes.js";
import adminSiteRoutes from "./routes/adminSiteRoutes.js";
import publicSiteRoutes from "./routes/publicSiteRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("O-TV server is running");
});

app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/videos", adminVideoRoutes);
app.use("/api/studio", studioRoutes);
app.use("/api/studio/videos", videoRoutes);
app.use("/api/admin/site", adminSiteRoutes);
app.use("/api/site", publicSiteRoutes);

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
