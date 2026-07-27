import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  ImageUp,
  Info,
  Mail,
  Phone,
  Save,
  Tv,
  User,
} from "lucide-react";

import { api } from "../../api/axios";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [channelName, setChannelName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [savingChannel, setSavingChannel] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/api/admin/users/${id}`);
      const loaded = data?.data?.user || data?.user;

      setUser(loaded);
      setFullName(loaded?.fullName || "");
      setEmail(loaded?.email || "");
      setPhone(loaded?.phone || "");
      setChannelName(loaded?.channel?.name || "");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load user");
      navigate("/all-users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.trim() && newPassword.trim().length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    try {
      setSaving(true);

      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      if (newPassword.trim()) {
        payload.newPassword = newPassword.trim();
      }

      const { data } = await api.put(`/api/admin/users/${id}`, payload);
      const updated = data?.data?.user || data?.user;

      setUser(updated);
      setNewPassword("");
      toast.success("User updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    const nextStatus = user.status === "active" ? "inactive" : "active";

    try {
      setTogglingStatus(true);

      const { data } = await api.patch(`/api/admin/users/${id}/status`, {
        status: nextStatus,
      });
      const updated = data?.data?.user || data?.user;

      setUser(updated);
      toast.success(
        nextStatus === "active"
          ? "User activated successfully"
          : "User deactivated successfully",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, JPEG, WEBP, or GIF images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 20MB or smaller");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleChannelSubmit = async (e) => {
    e.preventDefault();

    if (!channelName.trim()) {
      return toast.error("Channel name is required");
    }

    try {
      setSavingChannel(true);

      const formData = new FormData();
      formData.append("name", channelName.trim());
      if (logoFile) formData.append("logo", logoFile);

      const { data } = await api.put(`/api/admin/users/${id}/channel`, formData);
      const updatedChannel = data?.data?.channel || data?.channel;

      setUser((prev) => ({ ...prev, channel: updatedChannel }));
      setLogoFile(null);
      setPreviewUrl(null);
      toast.success("Channel updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update channel");
    } finally {
      setSavingChannel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Loading user...
      </div>
    );
  }

  if (!user) return null;

  const isActive = user.status !== "inactive";
  const currentLogoUrl = user.channel?.logo
    ? `${api.defaults.baseURL}${user.channel.logo}`
    : null;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl">
        <NavLink
          to="/all-users"
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-violet-200 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Users
        </NavLink>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] text-2xl font-black text-white shadow-lg shadow-[#8b5cf6]/30">
              {user.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white md:text-3xl">
                  {user.fullName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`}
                  />
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                <CalendarDays className="h-4 w-4" />
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleStatus}
            disabled={togglingStatus}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition disabled:opacity-60 ${
              isActive
                ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
            }`}
          >
            {isActive ? (
              <Ban className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isActive ? "Deactivate User" : "Activate User"}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Full Name
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#8b5cf6]/70 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20">
              <User className="h-5 w-5 text-[#8b5cf6]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#8b5cf6]/70 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20">
                <Mail className="h-5 w-5 text-[#8b5cf6]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Phone Number
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#8b5cf6]/70 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20">
                <Phone className="h-5 w-5 text-[#8b5cf6]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Reset Password
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#8b5cf6]/70 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave empty to keep current password"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer text-slate-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Changing the email, phone, or password will sign this user out
              on every device where they're currently logged in.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_50px_rgba(139,92,246,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            <Save className="h-5 w-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Channel management */}
        <form
          onSubmit={handleChannelSubmit}
          className="mt-6 space-y-5 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
        >
          <div className="flex items-center gap-2">
            <Tv className="h-5 w-5 text-[#8b5cf6]" />
            <h2 className="text-lg font-black text-white">Channel</h2>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Channel Name
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#8b5cf6]/70 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20">
              <Tv className="h-5 w-5 text-[#8b5cf6]" />
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="No channel created yet"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Channel Logo
            </label>

            <div className="mb-3 flex items-start gap-2 rounded-2xl border border-[#8b5cf6]/15 bg-[#8b5cf6]/5 px-4 py-3 text-xs leading-relaxed text-slate-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
              <span>
                Use a square image, ideally{" "}
                <span className="font-bold text-white">500×500px</span>, for
                the best fit in circular channel logos. Max file
                size: <span className="font-bold text-white">20MB</span>.
                Supported formats:{" "}
                <span className="font-bold text-white">
                  PNG, JPG, JPEG, WEBP, GIF
                </span>
                .
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#8b5cf6]/25 bg-black/30">
                {previewUrl || currentLogoUrl ? (
                  <img
                    src={previewUrl || currentLogoUrl}
                    alt={channelName || "Channel logo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Tv className="h-7 w-7 text-slate-500" />
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
                >
                  <ImageUp className="h-4 w-4" />
                  {currentLogoUrl ? "Change Logo" : "Upload Logo"}
                </button>

                {logoFile && (
                  <p className="mt-2 truncate text-xs text-slate-400">
                    Selected: {logoFile.name} (
                    {(logoFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingChannel}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_50px_rgba(139,92,246,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            <Save className="h-5 w-5" />
            {savingChannel ? "Saving..." : "Save Channel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserDetails;
