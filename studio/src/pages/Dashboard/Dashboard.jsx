import React from "react";
import { useSelector } from "react-redux";
import { Video, CheckCircle2, Clock, Eye, LayoutDashboard } from "lucide-react";

import { selectStudioUser } from "../../features/auth/authSelectors";

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

const Dashboard = () => {
  const user = useSelector(selectStudioUser);

  return (
    <div className="text-white">
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
        This is your creator dashboard — once video uploads go live, you'll
        track submissions, approvals, and audience reach right here. The
        numbers below are sample data for preview.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Video className="h-7 w-7 text-black" />}
          label="Total Videos"
          value="0"
          accent="bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309]"
        />
        <StatCard
          icon={<CheckCircle2 className="h-7 w-7 text-black" />}
          label="Approved"
          value="0"
          accent="bg-gradient-to-br from-[#fbbf24] to-[#d97706]"
        />
        <StatCard
          icon={<Clock className="h-7 w-7 text-black" />}
          label="Pending Review"
          value="0"
          accent="bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309]"
        />
        <StatCard
          icon={<Eye className="h-7 w-7 text-black" />}
          label="Total Views"
          value="0"
          accent="bg-gradient-to-br from-[#fbbf24] to-[#d97706]"
        />
      </div>

      <div className="mt-8 rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.04] p-6 text-sm text-slate-400">
        Video statistics will appear here automatically once the upload and
        approval backend is connected.
      </div>
    </div>
  );
};

export default Dashboard;
