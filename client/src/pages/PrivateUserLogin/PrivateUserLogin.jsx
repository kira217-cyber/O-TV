import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff } from "lucide-react";

import { privateUserLogin } from "../../features/privateAuth/privateAuthAPI";
import { setCredentials } from "../../features/privateAuth/privateAuthSlice";
import { selectIsPrivateAuthenticated } from "../../features/privateAuth/privateAuthSelectors";

const PrivateUserLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsPrivateAuthenticated);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/private-video", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      toast.error("Email/phone and password are required");
      return;
    }

    try {
      setSubmitting(true);
      const data = await privateUserLogin({ identifier: identifier.trim(), password });

      if (!data?.token || !data?.user?.email) {
        toast.error("Login failed");
        return;
      }

      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success("Login successful");
      navigate("/private-video", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-[#16d6dc]/20 bg-black/30 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5eeaf2] via-[#16d6dc] to-[#0e7a90] shadow-[0_0_40px_rgba(22,214,220,0.4)]">
            <Lock className="h-6 w-6 text-black" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-white">Private Access</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in with the account provided to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Email or Phone
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#16d6dc]/20 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#16d6dc]/70 focus:ring-2 focus:ring-[#16d6dc]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Password
            </label>
            <div className="flex items-center rounded-xl border border-[#16d6dc]/20 bg-black/40 px-4 py-3 transition focus-within:border-[#16d6dc]/70 focus-within:ring-2 focus-within:ring-[#16d6dc]/20">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5eeaf2] via-[#16d6dc] to-[#0e7a90] py-3 text-sm font-bold text-black shadow-lg shadow-[#16d6dc]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrivateUserLogin;
