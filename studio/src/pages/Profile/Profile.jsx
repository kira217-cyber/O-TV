import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Eye, EyeOff, Save, User } from "lucide-react";

import { api } from "../../api/axios";
import { selectStudioUser } from "../../features/auth/authSelectors";
import { logout } from "../../features/auth/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectStudioUser);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
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

      await api.put("/api/studio/profile", {
        fullName,
        email,
        phone,
        currentPassword,
        newPassword: newPassword.trim() || undefined,
      });

      // Email/phone/password change invalidates the session on every
      // device, including this one — send the user back to login.
      toast.success("Profile updated. Please login again.");
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309] shadow-lg shadow-[#f59e0b]/30">
          <User className="h-6 w-6 text-black" />
        </div>

        <div>
          <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-400">Content Creator</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Current Password
          </label>
          <div className="flex items-center rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/70 focus-within:ring-2 focus-within:ring-[#f59e0b]/20">
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
          <div className="flex items-center rounded-2xl border border-[#f59e0b]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/70 focus-within:ring-2 focus-within:ring-[#f59e0b]/20">
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
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] px-5 py-3.5 text-sm font-black text-black shadow-[0_18px_50px_rgba(245,158,11,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
