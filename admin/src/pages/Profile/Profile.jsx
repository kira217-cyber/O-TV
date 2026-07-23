import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Eye, EyeOff, Save, User } from "lucide-react";

import { api } from "../../api/axios";
import { selectAdmin } from "../../features/auth/authSelectors";
import { fetchAdminProfile } from "../../features/auth/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);

  const [email, setEmail] = useState(admin?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      return toast.error("Current password is required");
    }

    try {
      setSaving(true);

      await api.put("/api/admin/profile", {
        email,
        currentPassword,
        newPassword: newPassword.trim() || undefined,
      });

      toast.success("Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      dispatch(fetchAdminProfile());
    } catch (error) {
      toast.error(error?.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] shadow-lg shadow-[#8b5cf6]/30">
          <User className="h-6 w-6 text-white" />
        </div>

        <div>
          <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {admin?.role === "mother" ? "Mother Admin" : "Sub Admin"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Current Password
          </label>
          <div className="flex items-center rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#8b5cf6]/70 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to save changes"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((prev) => !prev)}
              className="cursor-pointer text-slate-300 hover:text-white"
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            New Password
          </label>
          <div className="flex items-center rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#8b5cf6]/70 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave empty to keep current password"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="cursor-pointer text-slate-300 hover:text-white"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_50px_rgba(139,92,246,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
