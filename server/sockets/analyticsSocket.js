import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

import Admin from "../models/Admin.js";
import StudioUser from "../models/StudioUser.js";

// Live-only presence/viewer tracking — nothing here is written to the
// database, it all lives in memory and resets on server restart. Keyed by
// socket.id so a single browser tab with multiple open players still maps
// to one session entry (rooms handle the per-video/channel grouping).
const sessions = new Map();

// Bounded recent-activity log (button clicks / actions reported by the
// client and studio apps) — most recent first, capped so it can't grow
// unbounded under heavy traffic.
const MAX_RECENT_ACTIONS = 100;
const recentActions = [];

const videoRoom = (id) => `video:${id}`;
const liveTvRoom = (id) => `livetv:${id}`;

// Keep client-supplied strings short — this is a live dashboard label, not
// a place for arbitrarily large or malicious payloads.
const clip = (value, max) =>
  typeof value === "string" ? value.slice(0, max) : "";

const buildSnapshot = () => {
  const perVideo = new Map();
  const perLiveTv = new Map();
  let clientCount = 0;
  let studioCount = 0;

  const list = [];

  sessions.forEach((session) => {
    if (session.role === "client") clientCount += 1;
    if (session.role === "studio") studioCount += 1;

    if (session.watching) {
      const { type, id, title } = session.watching;
      const bucket = type === "video" ? perVideo : perLiveTv;
      const entry = bucket.get(id) || { id, title, viewers: 0 };
      entry.viewers += 1;
      entry.title = title || entry.title;
      bucket.set(id, entry);
    }

    list.push({
      sessionId: session.sessionId,
      role: session.role,
      label: session.label,
      watching: session.watching,
      path: session.path,
      connectedAt: session.connectedAt,
    });
  });

  list.sort((a, b) => a.connectedAt - b.connectedAt);

  return {
    totalClients: clientCount,
    totalStudio: studioCount,
    videos: [...perVideo.values()].sort((a, b) => b.viewers - a.viewers),
    liveTv: [...perLiveTv.values()].sort((a, b) => b.viewers - a.viewers),
    sessions: list,
    generatedAt: Date.now(),
  };
};

export const attachAnalyticsSocket = (io) => {
  const admins = io.of("/analytics-admin");
  const feed = io.of("/analytics-feed");

  const broadcastSnapshot = () => {
    admins.emit("snapshot", buildSnapshot());
  };

  // Admin dashboard connections — verified via the same admin JWT used by
  // the REST API, just passed through the socket handshake instead of a
  // header, since this is a plain WebSocket upgrade.
  admins.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Not authorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin) return next(new Error("Not authorized"));

      next();
    } catch {
      next(new Error("Not authorized"));
    }
  });

  admins.on("connection", (socket) => {
    socket.emit("snapshot", buildSnapshot());
    socket.emit("activityHistory", recentActions);

    socket.on("disconnect", () => {
      // No session state kept for admin observers — nothing to clean up.
    });
  });

  // Client site / Studio connections — the ones actually being tracked.
  feed.use(async (socket, next) => {
    const { role, token } = socket.handshake.auth || {};

    if (role === "studio" && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await StudioUser.findById(decoded.id).select("fullName channel");
        if (user) {
          socket.data.role = "studio";
          socket.data.label = user.channel?.name || user.fullName;
          return next();
        }
      } catch {
        // Falls through to anonymous client below.
      }
    }

    socket.data.role = "client";
    socket.data.label = socket.handshake.auth?.visitorId
      ? `Guest ${String(socket.handshake.auth.visitorId).slice(0, 6).toUpperCase()}`
      : "Guest";
    next();
  });

  feed.on("connection", (socket) => {
    const sessionId = randomUUID();

    sessions.set(socket.id, {
      sessionId,
      role: socket.data.role,
      label: socket.data.label,
      watching: null,
      path: null,
      connectedAt: Date.now(),
    });

    broadcastSnapshot();

    socket.on("watch:start", (payload) => {
      const session = sessions.get(socket.id);
      if (!session) return;

      const type = payload?.type === "liveTv" ? "liveTv" : "video";
      const id = payload?.id ? String(payload.id) : null;
      if (!id) return;

      // Leave whatever room this socket was previously in, if any.
      if (session.watching) {
        const previousRoom =
          session.watching.type === "video"
            ? videoRoom(session.watching.id)
            : liveTvRoom(session.watching.id);
        socket.leave(previousRoom);
      }

      socket.join(type === "video" ? videoRoom(id) : liveTvRoom(id));
      session.watching = { type, id, title: payload?.title || "" };
      broadcastSnapshot();
    });

    socket.on("watch:stop", () => {
      const session = sessions.get(socket.id);
      if (!session || !session.watching) return;

      const room =
        session.watching.type === "video"
          ? videoRoom(session.watching.id)
          : liveTvRoom(session.watching.id);
      socket.leave(room);
      session.watching = null;
      broadcastSnapshot();
    });

    // Which page/route this session is currently browsing — reported by
    // the app root on every navigation, independent of whether a
    // video/live-tv player is open.
    socket.on("page:view", (payload) => {
      const session = sessions.get(socket.id);
      if (!session) return;

      session.path = clip(payload?.path, 200) || null;
      broadcastSnapshot();
    });

    // Generic action tag (button clicks, player controls, search, etc.)
    // for the admin live activity feed — deliberately not tied to
    // watch:start/stop so it also covers actions outside a player.
    socket.on("user:action", (payload) => {
      const session = sessions.get(socket.id);
      if (!session) return;

      const entry = {
        sessionId: session.sessionId,
        role: session.role,
        label: session.label,
        action: clip(payload?.action, 80) || "Action",
        meta: clip(payload?.meta, 120),
        path: session.path,
        at: Date.now(),
      };

      recentActions.unshift(entry);
      if (recentActions.length > MAX_RECENT_ACTIONS) {
        recentActions.length = MAX_RECENT_ACTIONS;
      }

      admins.emit("activity", entry);
    });

    socket.on("disconnect", () => {
      sessions.delete(socket.id);
      broadcastSnapshot();
    });
  });
};

export default attachAnalyticsSocket;
