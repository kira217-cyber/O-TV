import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  FaHome,
  FaBell,
  FaSignOutAlt,
  FaSearch,
  FaUserCircle,
  FaTimes,
  FaVideo,
  FaCloudUploadAlt,
  FaTv,
  FaBullhorn,
} from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudioProfile, logout } from "../../features/auth/authSlice";
import { selectStudioUser } from "../../features/auth/authSelectors";

const menuItems = [
  { to: "/", icon: <FaHome />, text: "Dashboard", end: true },
  { to: "/my-channel", icon: <FaTv />, text: "My Channel" },
  { to: "/my-videos", icon: <FaVideo />, text: "My Videos" },
  { to: "/upload-video", icon: <FaCloudUploadAlt />, text: "Upload Video" },
  { to: "/promote-video", icon: <FaBullhorn />, text: "Promotion Video" },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectStudioUser);

  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    // Re-validate the session against the server as soon as the
    // authenticated area mounts, so a deactivated/logged-out-elsewhere
    // account is bounced to /login right away instead of only on the
    // next page that happens to call an API.
    dispatch(fetchStudioProfile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) setOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0b0e0f] text-white">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#78350f] via-[#f59e0b] to-[#b45309] px-4 py-3 flex items-center justify-between shadow-lg shadow-[#f59e0b]/30 border-b border-[#f59e0b]/20">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <h2 className="text-lg font-black text-white">Studio</h2>

        <NavLink to="/profile" className="cursor-pointer">
          <FaUserCircle className="text-2xl text-white hover:text-amber-200 transition-colors cursor-pointer" />
        </NavLink>
      </div>

      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden cursor-pointer"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 24, stiffness: 190 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-[#0b0e0f] via-[#241505] to-[#0b0e0f] border-r border-[#f59e0b]/20 shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-[#f59e0b]/20 bg-gradient-to-r from-black/80 via-[#f59e0b]/15 to-black/80 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309] flex items-center justify-center shadow-lg shadow-[#f59e0b]/40">
                  <span className="text-black font-black text-3xl">S</span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    STUDIO
                  </h2>
                  <p className="text-sm text-amber-200/80 font-medium">
                    O-TV Creator Panel
                  </p>
                </div>
              </div>
            </div>

            {!isDesktop && (
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <FaTimes size={22} />
              </button>
            )}

            <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-semibold transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] text-black shadow-lg shadow-[#f59e0b]/30"
                        : "text-slate-200 hover:bg-[#f59e0b]/15 hover:text-white"
                    }`
                  }
                >
                  <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-5 border-t border-[#f59e0b]/20 mt-auto shrink-0">
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-[#f59e0b] to-[#b45309] rounded-xl text-black font-black transition-all duration-300 shadow-lg shadow-[#f59e0b]/30 border border-[#f59e0b]/30 hover:scale-[1.01]"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-5 border-b border-[#f59e0b]/20 bg-gradient-to-r from-black/80 via-[#f59e0b]/10 to-black/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f59e0b] text-lg" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-12 pr-5 py-3 bg-black/40 border border-[#f59e0b]/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2.5 hover:bg-[#f59e0b]/15 rounded-xl transition-colors cursor-pointer">
                <FaBell className="text-xl text-[#f59e0b]" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#f59e0b] rounded-full ring-2 ring-[#f59e0b]/60"></span>
              </button>

              <NavLink
                to="/profile"
                className="flex items-center gap-2 p-1 pr-3 hover:bg-[#f59e0b]/15 rounded-full transition-colors cursor-pointer"
              >
                <FaUserCircle className="text-3xl text-[#f59e0b]" />
                <span className="text-sm font-semibold text-white">
                  {user?.fullName || "Creator"}
                </span>
              </NavLink>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto [scrollbar-width:none] bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(180,83,9,0.12),transparent_40%),linear-gradient(135deg,#0b0e0f,#1a1206,#0b0e0f)]">
            <div className="mt-16 md:mt-0 p-4 lg:p-6 text-white">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
