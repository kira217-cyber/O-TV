import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  IdCard,
  Loader2,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles,
  Tv,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, NavLink } from "react-router";
import { toast } from "react-toastify";

import { studioLogin } from "../../features/auth/authAPI";
import { setCredentials } from "../../features/auth/authSlice";
import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const orbitIcons = [
  { Icon: Tv, className: "left-[16%] top-[16%]", duration: 5 },
  { Icon: Users, className: "right-[14%] top-[22%]", duration: 4.2 },
  { Icon: Radio, className: "left-[18%] bottom-[20%]", duration: 4.8 },
  { Icon: Sparkles, className: "right-[18%] bottom-[26%]", duration: 3.6 },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const from = location.state?.from?.pathname || "/";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identifier.trim()) {
      return toast.error("Email or phone is required");
    }

    if (!formData.password.trim()) {
      return toast.error("Password is required");
    }

    try {
      setIsSubmitting(true);

      const data = await studioLogin({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      if (!data?.token || !data?.user?.email) {
        toast.error("Login response invalid");
        return;
      }

      dispatch(setCredentials({ user: data.user, token: data.token }));

      toast.success("Login successful");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonLoading = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-[#0b0e0f] text-white lg:grid lg:grid-cols-2">
      {/* ================= LEFT: animation panel ================= */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-black via-[#0b0e0f] to-[#1a1206] lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#f59e0b]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-16 h-80 w-80 rounded-full bg-[#b45309]/20 blur-3xl" />

        {orbitIcons.map(({ Icon, className, duration }, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [1, 1.1, 1] }}
            transition={{
              opacity: { duration: 0.6, delay: index * 0.15 },
              scale: { duration, repeat: Infinity, ease: "easeInOut" },
            }}
            className={`absolute flex h-16 w-16 items-center justify-center rounded-full border border-[#f59e0b]/25 bg-white/5 shadow-lg shadow-[#f59e0b]/20 backdrop-blur-sm ${className}`}
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
            <ShieldCheck className="h-10 w-10 text-[#fbbf24]" />
          </div>

          <h2 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent">
            Welcome Back, Creator
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Log back in to manage your uploads, check approval status, and
            keep growing your audience on Pipra-TV.
          </p>
        </motion.div>
      </div>

      {/* ================= RIGHT: form ================= */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_38%)] lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-[460px]"
        >
          <div className="mb-6 text-center lg:text-left">
            <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
              Pipra-TV Studio Login
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              Sign in to your creator dashboard.
            </p>
          </div>

          <div className="rounded-[32px] border border-[#f59e0b]/20 bg-white/[0.07] p-6 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Email or Phone
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#f59e0b]/60 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.20)]">
                  <IdCard className="h-5 w-5 text-[#f59e0b]" />
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="creator@pipratv.com or 01700000000"
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
                    placeholder="Enter password"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="cursor-pointer text-slate-300 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
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
                    Logging in...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Login to Studio
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-300">
              New to Pipra-TV Studio?{" "}
              <NavLink
                to="/register"
                className="cursor-pointer font-bold text-[#fbbf24] hover:text-[#fde68a]"
              >
                Create an account
              </NavLink>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
