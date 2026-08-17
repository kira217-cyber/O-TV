import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  UploadCloud,
  Film,
  Sparkles,
  PlayCircle,
  Clapperboard,
} from "lucide-react";

import { studioRegister } from "../../features/auth/authAPI";
import { setCredentials } from "../../features/auth/authSlice";
import { selectAuthLoading } from "../../features/auth/authSelectors";

const floatingIcons = [
  { Icon: UploadCloud, className: "left-[12%] top-[18%]", delay: 0 },
  { Icon: Film, className: "right-[15%] top-[28%]", delay: 0.4 },
  { Icon: PlayCircle, className: "left-[20%] bottom-[24%]", delay: 0.8 },
  { Icon: Sparkles, className: "right-[20%] bottom-[16%]", delay: 1.2 },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectAuthLoading);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!formData.phone.trim()) return toast.error("Phone number is required");

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setIsSubmitting(true);

      const data = await studioRegister({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (!data?.token || !data?.user?.email) {
        toast.error("Registration response invalid");
        return;
      }

      dispatch(setCredentials({ user: data.user, token: data.token }));

      toast.success("Welcome to Pipra-TV Studio!");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonLoading = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-[#0b0e0f] text-white lg:grid lg:grid-cols-2">
      {/* ================= LEFT: animation panel ================= */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1a1206] via-[#0b0e0f] to-black lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#f59e0b]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[#b45309]/20 blur-3xl" />

        {floatingIcons.map(({ Icon, className, delay }, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: [0, -18, 0] }}
            transition={{
              opacity: { duration: 0.6, delay },
              y: { duration: 3.4, repeat: Infinity, delay, ease: "easeInOut" },
            }}
            className={`absolute flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f59e0b]/25 bg-white/5 shadow-lg shadow-[#f59e0b]/20 backdrop-blur-sm ${className}`}
          >
            <Icon className="h-7 w-7 text-[#fbbf24]" />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 max-w-md px-10 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#f59e0b]/30 bg-white/10 shadow-[0_0_45px_rgba(245,158,11,0.28)] backdrop-blur">
            <Clapperboard className="h-10 w-10 text-[#fbbf24]" />
          </div>

          <h2 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent">
            Start Creating Today
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Join Pipra-TV Studio and share your movies, shows, and live streams
            with a growing audience. Upload your content, track its
            performance, and grow your channel — all from one dashboard.
          </p>
        </motion.div>
      </div>

      {/* ================= RIGHT: form ================= */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_38%)] lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-[460px]"
        >
          <div className="mb-6 text-center lg:text-left">
            <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
              Create Your Studio Account
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              Fill in your details to get started as a creator on Pipra-TV.
            </p>
          </div>

          <div className="rounded-[32px] border border-[#f59e0b]/20 bg-white/[0.07] p-6 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Full Name
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/60 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.20)]">
                  <User className="h-5 w-5 text-[#f59e0b]" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/60 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.20)]">
                  <Mail className="h-5 w-5 text-[#f59e0b]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="creator@pipratv.com"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Phone Number
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/60 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.20)]">
                  <Phone className="h-5 w-5 text-[#f59e0b]" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01700000000"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/60 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.20)]">
                  <Lock className="h-5 w-5 text-[#f59e0b]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="cursor-pointer text-slate-300 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Confirm Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/60 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.20)]">
                  <Lock className="h-5 w-5 text-[#f59e0b]" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="cursor-pointer text-slate-300 transition hover:text-white"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={buttonLoading}
                className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] px-5 py-3.5 text-sm font-black text-black shadow-[0_18px_50px_rgba(245,158,11,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />

                {buttonLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-5 w-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-300">
              Already have an account?{" "}
              <NavLink
                to="/login"
                className="cursor-pointer font-bold text-[#fbbf24] hover:text-[#fde68a]"
              >
                Login here
              </NavLink>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
