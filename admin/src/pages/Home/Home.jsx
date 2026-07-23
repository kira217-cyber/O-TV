import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Wallet,
  HandCoins,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

import { api } from "../../api/axios";
import { selectAdmin } from "../../features/auth/authSelectors";

const StatCard = ({ icon, label, value, accent }) => (
  <div className="rounded-[24px] border border-[#8b5cf6]/20 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-black text-white">{value}</p>
      </div>

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

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
      } catch (error) {
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
            {admin?.email} · {admin?.role === "mother" ? "Mother Admin" : "Sub Admin"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<ShieldCheck className="h-7 w-7 text-white" />}
          label="Total Admins"
          value={totalAdmins ?? "—"}
          accent="bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca]"
        />
        <StatCard
          icon={<Users className="h-7 w-7 text-white" />}
          label="Total Users"
          value="—"
          accent="bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
        />
        <StatCard
          icon={<Wallet className="h-7 w-7 text-white" />}
          label="Pending Deposits"
          value="—"
          accent="bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca]"
        />
        <StatCard
          icon={<HandCoins className="h-7 w-7 text-white" />}
          label="Pending Withdraws"
          value="—"
          accent="bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
        />
      </div>

      <div className="mt-8 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.04] p-6 text-sm text-slate-400">
        User, deposit ও withdraw স্ট্যাটিস্টিক্স তখনই দেখাবে যখন সংশ্লিষ্ট ব্যাকএন্ড API
        সার্ভারে যুক্ত করা হবে।
      </div>
    </div>
  );
};

export default Home;
