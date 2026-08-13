import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  MousePointerClick,
  Radio,
  Users,
  Video,
  Wifi,
  WifiOff,
} from "lucide-react";

import { api } from "../../api/axios";

const SESSIONS_PAGE_SIZE = 10;
const MAX_ACTIVITY_ITEMS = 100;

const formatDuration = (connectedAt, now) => {
  const seconds = Math.max(0, Math.floor((now - connectedAt) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const formatRelative = (at, now) => {
  const seconds = Math.max(0, Math.floor((now - at) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  return `${m}m ago`;
};

const StatCard = ({ icon, label, value, accent }) => (
  <div className="rounded-[24px] border border-[#8b5cf6]/20 bg-white/[0.06] p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  </div>
);

const RoleBadge = ({ role }) => (
  <span
    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
      role === "studio"
        ? "bg-amber-500/15 text-amber-400"
        : "bg-cyan-500/15 text-cyan-300"
    }`}
  >
    {role === "studio" ? "Studio" : "Client"}
  </span>
);

const SiteAnalytics = () => {
  const [connected, setConnected] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [activities, setActivities] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [sessionsPage, setSessionsPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const socket = io(`${api.defaults.baseURL}/analytics-admin`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("snapshot", (data) => setSnapshot(data));
    socket.on("activityHistory", (history) => setActivities(history || []));
    socket.on("activity", (entry) => {
      setActivities((previous) => [entry, ...previous].slice(0, MAX_ACTIVITY_ITEMS));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalLive = (snapshot?.totalClients || 0) + (snapshot?.totalStudio || 0);

  const sessions = snapshot?.sessions || [];
  const totalSessionPages = Math.max(1, Math.ceil(sessions.length / SESSIONS_PAGE_SIZE));
  const clampedPage = Math.min(sessionsPage, totalSessionPages);
  const pagedSessions = sessions.slice(
    (clampedPage - 1) * SESSIONS_PAGE_SIZE,
    clampedPage * SESSIONS_PAGE_SIZE,
  );

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            Site Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Live, real-time view of who's on the site right now — nothing
            here is stored, it reflects this exact moment only.
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold ${
            connected
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}
        >
          {connected ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          {connected ? "Live" : "Connecting..."}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Activity className="h-5 w-5 text-white" />}
          label="Total Live Right Now"
          value={totalLive}
          accent="bg-gradient-to-br from-[#c4b5fd] to-[#4338ca]"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-white" />}
          label="Client Site Viewers"
          value={snapshot?.totalClients ?? 0}
          accent="bg-gradient-to-br from-[#5eead4] to-[#0891b2]"
        />
        <StatCard
          icon={<Video className="h-5 w-5 text-white" />}
          label="Videos Being Watched"
          value={snapshot?.videos?.length ?? 0}
          accent="bg-gradient-to-br from-[#fca5a5] to-[#b91c1c]"
        />
        <StatCard
          icon={<Radio className="h-5 w-5 text-white" />}
          label="Live TV Channels Active"
          value={snapshot?.liveTv?.length ?? 0}
          accent="bg-gradient-to-br from-[#fcd34d] to-[#b45309]"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
            <Clapperboard className="h-5 w-5 text-[#8b5cf6]" />
            Videos Being Watched Now
          </h2>

          {!snapshot || snapshot.videos.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No one is watching a video right now.
            </p>
          ) : (
            <div className="space-y-2">
              {snapshot.videos.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[#8b5cf6]/15 bg-black/25 px-4 py-3"
                >
                  <p className="truncate text-sm font-semibold text-slate-200">
                    {item.title || item.id}
                  </p>
                  <span className="ml-3 shrink-0 rounded-full bg-[#8b5cf6]/15 px-3 py-1 text-xs font-bold text-violet-300">
                    {item.viewers} watching
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
            <Radio className="h-5 w-5 text-[#8b5cf6]" />
            Live TV Channels Being Watched Now
          </h2>

          {!snapshot || snapshot.liveTv.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No one is watching a Live TV channel right now.
            </p>
          ) : (
            <div className="space-y-2">
              {snapshot.liveTv.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[#8b5cf6]/15 bg-black/25 px-4 py-3"
                >
                  <p className="truncate text-sm font-semibold text-slate-200">
                    {item.title || item.id}
                  </p>
                  <span className="ml-3 shrink-0 rounded-full bg-[#8b5cf6]/15 px-3 py-1 text-xs font-bold text-violet-300">
                    {item.viewers} watching
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              <Users className="h-5 w-5 text-[#8b5cf6]" />
              Active Sessions {sessions.length > 0 ? `(${sessions.length})` : ""}
            </h2>

            {totalSessionPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSessionsPage((p) => Math.max(1, p - 1))}
                  disabled={clampedPage <= 1}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 text-violet-200 transition hover:bg-[#8b5cf6]/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-slate-300">
                  Page {clampedPage} / {totalSessionPages}
                </span>
                <button
                  type="button"
                  onClick={() => setSessionsPage((p) => Math.min(totalSessionPages, p + 1))}
                  disabled={clampedPage >= totalSessionPages}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 text-violet-200 transition hover:bg-[#8b5cf6]/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No one is on the site right now.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#8b5cf6]/15 text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4 font-semibold">Who</th>
                    <th className="pb-3 pr-4 font-semibold">Role</th>
                    <th className="pb-3 pr-4 font-semibold">Watching</th>
                    <th className="pb-3 pr-4 font-semibold">Page</th>
                    <th className="pb-3 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedSessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      className="border-b border-[#8b5cf6]/10 last:border-0"
                    >
                      <td className="py-3 pr-4 font-semibold text-white">
                        {session.label}
                      </td>
                      <td className="py-3 pr-4">
                        <RoleBadge role={session.role} />
                      </td>
                      <td className="py-3 pr-4 truncate text-slate-300">
                        {session.watching
                          ? `${session.watching.type === "liveTv" ? "Live TV" : "Video"} — ${
                              session.watching.title || session.watching.id
                            }`
                          : "Browsing"}
                      </td>
                      <td className="py-3 pr-4 truncate font-mono text-xs text-slate-400">
                        {session.path || "—"}
                      </td>
                      <td className="py-3 tabular-nums text-slate-400">
                        {formatDuration(session.connectedAt, now)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
            <MousePointerClick className="h-5 w-5 text-[#8b5cf6]" />
            Live Activity Feed
          </h2>

          {activities.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No actions yet.
            </p>
          ) : (
            <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {activities.map((entry, index) => (
                <div
                  key={`${entry.sessionId}-${entry.at}-${index}`}
                  className="rounded-2xl border border-[#8b5cf6]/15 bg-black/25 px-4 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <RoleBadge role={entry.role} />
                      <span className="truncate text-xs font-bold text-white">
                        {entry.label}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-500">
                      {formatRelative(entry.at, now)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-300">
                    {entry.action}
                    {entry.meta ? ` — ${entry.meta}` : ""}
                  </p>
                  {entry.path && (
                    <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">
                      {entry.path}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteAnalytics;
