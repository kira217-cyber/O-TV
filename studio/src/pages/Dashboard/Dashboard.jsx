import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Video,
  CheckCircle2,
  Clock,
  Eye,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { api } from "../../api/axios";
import { selectStudioUser } from "../../features/auth/authSelectors";

const AMBER_PALETTE = ["#f59e0b", "#fbbf24", "#d97706", "#fde68a", "#b45309", "#92400e"];

const StatCard = ({ icon, label, value, accent }) => (
  <div className="rounded-[24px] border border-[#f59e0b]/20 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-black text-white">{value}</p>
      </div>

      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accent}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const ChartPanel = ({ icon, title, subtitle, children, className = "" }) => (
  <div
    className={`rounded-[24px] border border-[#f59e0b]/20 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur-xl ${className}`}
  >
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309]">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const EmptyChartState = ({ label }) => (
  <div className="flex h-[220px] items-center justify-center text-center text-xs text-slate-500">
    {label}
  </div>
);

const chartTooltipStyle = {
  contentStyle: {
    background: "#171310",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#fff",
  },
  labelStyle: { color: "#fbbf24", fontWeight: 700 },
  itemStyle: { color: "#e5e7eb" },
};

const Dashboard = () => {
  const user = useSelector(selectStudioUser);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/api/studio/videos/stats");
        setStats(data?.data || null);
      } catch {
        setStats(null);
      }
    };

    loadStats();
  }, []);

  const uploadsOverTime = stats?.uploadsOverTime || [];
  const topVideosByViews = (stats?.topVideosByViews || []).map((v) => ({
    ...v,
    shortTitle: v.title?.length > 14 ? `${v.title.slice(0, 14)}…` : v.title,
  }));
  const categoryBreakdown = stats?.categoryBreakdown || [];
  const statusBreakdown = stats
    ? [
        { name: "Approved", value: stats.active },
        { name: "Pending", value: stats.pending },
        { name: "Rejected", value: stats.rejected },
      ].filter((entry) => entry.value > 0)
    : [];

  const hasAnyUploads = uploadsOverTime.some((entry) => entry.count > 0);

  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309] shadow-lg shadow-[#f59e0b]/30">
          <LayoutDashboard className="h-6 w-6 text-black" />
        </div>

        <div>
          <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            Welcome back, {user?.fullName?.split(" ")[0] || "Creator"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {user?.email} · Content Creator
          </p>
        </div>
      </div>

      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-400">
        This is your creator dashboard — track your submissions, approvals,
        and audience reach right here.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Video className="h-7 w-7 text-black" />}
          label="Total Videos"
          value={stats?.total ?? "—"}
          accent="bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309]"
        />
        <StatCard
          icon={<CheckCircle2 className="h-7 w-7 text-black" />}
          label="Approved"
          value={stats?.active ?? "—"}
          accent="bg-gradient-to-br from-[#fbbf24] to-[#d97706]"
        />
        <StatCard
          icon={<Clock className="h-7 w-7 text-black" />}
          label="Pending Review"
          value={stats?.pending ?? "—"}
          accent="bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309]"
        />
        <StatCard
          icon={<Eye className="h-7 w-7 text-black" />}
          label="Total Views"
          value={stats?.views ?? "—"}
          accent="bg-gradient-to-br from-[#fbbf24] to-[#d97706]"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartPanel
          icon={<TrendingUp className="h-4 w-4 text-black" />}
          title="Uploads Over Time"
          subtitle="Videos submitted per month, last 6 months"
          className="xl:col-span-2"
        >
          {!stats ? (
            <EmptyChartState label="Loading..." />
          ) : !hasAnyUploads ? (
            <EmptyChartState label="No uploads yet — your first video will show up here." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={uploadsOverTime} margin={{ left: -20, right: 8 }}>
                <defs>
                  <linearGradient id="uploadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Uploads"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#uploadsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel
          icon={<PieChartIcon className="h-4 w-4 text-black" />}
          title="Approval Status"
          subtitle="Where your videos currently stand"
        >
          {!stats ? (
            <EmptyChartState label="Loading..." />
          ) : statusBreakdown.length === 0 ? (
            <EmptyChartState label="No videos yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={AMBER_PALETTE[index % AMBER_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {statusBreakdown.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {statusBreakdown.map((entry, index) => (
                <span key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: AMBER_PALETTE[index % AMBER_PALETTE.length] }}
                  />
                  {entry.name} ({entry.value})
                </span>
              ))}
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          icon={<BarChart3 className="h-4 w-4 text-black" />}
          title="Top Videos by Views"
          subtitle="Your best-performing uploads"
        >
          {!stats ? (
            <EmptyChartState label="Loading..." />
          ) : topVideosByViews.length === 0 ? (
            <EmptyChartState label="No videos yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topVideosByViews} margin={{ left: -20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="shortTitle"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  {...chartTooltipStyle}
                  formatter={(value) => [value, "Views"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ""}
                />
                <Bar dataKey="views" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel
          icon={<PieChartIcon className="h-4 w-4 text-black" />}
          title="Videos by Category"
          subtitle="What kind of content you upload most"
          className="xl:col-span-2"
        >
          {!stats ? (
            <EmptyChartState label="Loading..." />
          ) : categoryBreakdown.length === 0 ? (
            <EmptyChartState label="No videos yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="count"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={entry.category} fill={AMBER_PALETTE[index % AMBER_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {categoryBreakdown.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {categoryBreakdown.map((entry, index) => (
                <span key={entry.category} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: AMBER_PALETTE[index % AMBER_PALETTE.length] }}
                  />
                  {entry.category} ({entry.count})
                </span>
              ))}
            </div>
          )}
        </ChartPanel>
      </div>
    </div>
  );
};

export default Dashboard;
