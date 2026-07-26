import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Wallet,
  HandCoins,
  ShieldCheck,
  LayoutDashboard,
  Film,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  CalendarDays,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

import { api } from "../../api/axios";
import { selectAdmin } from "../../features/auth/authSelectors";

/* =========================================================
   Stat Card
========================================================= */
const StatCard = ({ icon, label, value, accent, trend, trendUp = true }) => (
  <div className="rounded-[24px] border border-[#8b5cf6]/20 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-black text-white sm:text-3xl">
          {value}
        </p>
      </div>

      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accent}`}
      >
        {icon}
      </div>
    </div>

    {trend && (
      <div className="mt-4 flex items-center gap-1.5">
        {trendUp ? (
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-rose-400" />
        )}
        <span
          className={`text-xs font-bold ${trendUp ? "text-emerald-400" : "text-rose-400"}`}
        >
          {trend}
        </span>
      </div>
    )}
  </div>
);

/* =========================================================
   Donut ("round") chart — Content Library Distribution
========================================================= */
const DonutChart = ({ data, size = 190, strokeWidth = 24 }) => {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce((acc, slice) => {
    const dash = (slice.value / total) * circumference;
    const previous = acc[acc.length - 1];
    const offset = previous ? previous.offset + previous.dash : 0;

    return [...acc, { ...slice, dash, offset }];
  }, []);

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />

        {segments.map((slice) => (
          <motion.circle
            key={slice.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${slice.dash} ${circumference - slice.dash}`}
            strokeDashoffset={-slice.offset}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-white">{total}</span>
        <span className="text-[11px] font-semibold text-slate-400">
          Titles
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   Bar ("building") chart — Weekly New Signups
========================================================= */
const BarChart = ({ data }) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div>
      <div className="flex h-44 items-end gap-2.5 sm:gap-3.5">
        {data.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
            className="mx-auto w-full max-w-[30px] rounded-t-lg bg-gradient-to-t from-[#4338ca] to-[#8b5cf6] sm:max-w-[36px]"
          />
        ))}
      </div>

      <div className="mt-2 flex gap-2.5 sm:gap-3.5">
        {data.map((item) => (
          <span
            key={item.label}
            className="flex-1 text-center text-[10px] font-bold text-slate-400 sm:text-xs"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   Live clock + calendar
========================================================= */
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const buildMonthCells = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  return cells;
};

const LiveClockCalendar = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const fullDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const cells = useMemo(
    () => buildMonthCells(now),
    [currentMonth, currentYear], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const today = now.getDate();

  return (
    <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Live
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-white">
        <Clock className="h-6 w-6 text-[#8b5cf6]" />
        <span className="text-3xl font-black tabular-nums sm:text-4xl">
          {time}
        </span>
      </div>

      <p className="mt-1 text-sm font-semibold text-slate-300">{fullDate}</p>

      <div className="mt-5 border-t border-[#8b5cf6]/15 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#8b5cf6]" />
          <span className="text-sm font-bold text-white">{monthLabel}</span>
        </div>

        <div className="grid grid-cols-7 gap-y-1.5 text-center">
          {WEEKDAY_LABELS.map((day) => (
            <span
              key={day}
              className="text-[10px] font-bold uppercase text-slate-500"
            >
              {day}
            </span>
          ))}

          {cells.map((day, index) => (
            <span
              key={index}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                day === today
                  ? "bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] text-white shadow-md shadow-[#8b5cf6]/40"
                  : day
                    ? "text-slate-300"
                    : ""
              }`}
            >
              {day || ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Demo data — modelled on this project's actual sections
========================================================= */
const contentDistribution = [
  { label: "Hollywood", value: 320, color: "#8b5cf6" },
  { label: "Live TV", value: 260, color: "#22d3ee" },
  { label: "Free Movie", value: 230, color: "#a855f7" },
  { label: "Horror", value: 180, color: "#f472b6" },
  { label: "Football", value: 150, color: "#4338ca" },
  { label: "Trending", value: 144, color: "#c4b5fd" },
];

const weeklySignups = [
  { label: "Mon", value: 182 },
  { label: "Tue", value: 246 },
  { label: "Wed", value: 214 },
  { label: "Thu", value: 298 },
  { label: "Fri", value: 356 },
  { label: "Sat", value: 410 },
  { label: "Sun", value: 332 },
];

const Home = () => {
  const admin = useSelector(selectAdmin);
  const [totalAdmins, setTotalAdmins] = useState(null);

  useEffect(() => {
    if (admin?.role !== "mother") return;

    const loadAdmins = async () => {
      try {
        const { data } = await api.get("/api/admin/admins");
        const admins = data?.data?.admins || data?.admins || [];
        setTotalAdmins(admins.length);
      } catch {
        setTotalAdmins(null);
      }
    };

    loadAdmins();
  }, [admin?.role]);

  return (
    <div className="text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] shadow-lg shadow-[#8b5cf6]/30">
          <LayoutDashboard className="h-6 w-6 text-white" />
        </div>

        <div>
          <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {admin?.email} ·{" "}
            {admin?.role === "mother" ? "Mother Admin" : "Sub Admin"}
          </p>
        </div>
      </div>

      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-400">
        A quick, at-a-glance summary of how O-TV is performing — your
        audience, your content library, and your platform's financial
        activity, all in one place. The figures below are sample data for
        preview; live numbers will appear automatically once each backend
        API is connected.
      </p>

      {/* 6 stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<Users className="h-7 w-7 text-white" />}
          label="Total Users"
          value="12,480"
          accent="bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
          trend="+8.2% this week"
          trendUp
        />
        <StatCard
          icon={<Film className="h-7 w-7 text-white" />}
          label="Total Content"
          value="1,284"
          accent="bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca]"
          trend="+36 new this month"
          trendUp
        />
        <StatCard
          icon={<ShieldCheck className="h-7 w-7 text-white" />}
          label="Total Admins"
          value={totalAdmins ?? "6"}
          accent="bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
        />
        <StatCard
          icon={<Wallet className="h-7 w-7 text-white" />}
          label="Pending Deposits"
          value="৳ 4,28,500"
          accent="bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca]"
          trend="62 requests waiting"
          trendUp={false}
        />
        <StatCard
          icon={<HandCoins className="h-7 w-7 text-white" />}
          label="Pending Withdraws"
          value="৳ 1,56,200"
          accent="bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
          trend="24 requests waiting"
          trendUp={false}
        />
        <StatCard
          icon={<TrendingUp className="h-7 w-7 text-white" />}
          label="Monthly Revenue"
          value="৳ 12,45,000"
          accent="bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca]"
          trend="+14.6% vs last month"
          trendUp
        />
      </div>

      {/* Charts + live clock/calendar */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Donut chart */}
        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-1 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#8b5cf6]" />
            <h2 className="text-lg font-black text-white">
              Content Library Distribution
            </h2>
          </div>
          <p className="mb-5 text-xs text-slate-400">
            Share of published titles across each category.
          </p>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
            <DonutChart data={contentDistribution} />

            <ul className="w-full space-y-2.5 sm:w-auto">
              {contentDistribution.map((slice) => (
                <li
                  key={slice.label}
                  className="flex items-center justify-between gap-6 text-sm"
                >
                  <span className="flex items-center gap-2 font-semibold text-slate-300">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    {slice.label}
                  </span>
                  <span className="font-bold text-white">{slice.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bar chart */}
        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-1 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#8b5cf6]" />
            <h2 className="text-lg font-black text-white">
              Weekly New Signups
            </h2>
          </div>
          <p className="mb-5 text-xs text-slate-400">
            New user registrations over the last 7 days.
          </p>

          <BarChart data={weeklySignups} />

          <p className="mt-5 text-xs leading-relaxed text-slate-400">
            Signups are trending upward heading into the weekend — Saturday
            was the strongest day with{" "}
            <span className="font-bold text-white">410 new users</span>.
          </p>
        </div>

        {/* Live clock + calendar */}
        <LiveClockCalendar />
      </div>
    </div>
  );
};

export default Home;
