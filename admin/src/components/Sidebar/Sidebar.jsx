import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  FaHome,
  FaBell,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaWallet,
  FaMoneyBillWave,
  FaPlusCircle,
  FaClipboardList,
  FaLayerGroup,
  FaSlidersH,
  FaUserShield,
  FaShareAlt,
  FaImage,
  FaFilm,
  FaGlobe,
} from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa6";
import { IoFootstepsOutline } from "react-icons/io5";
import { GrUserAdmin } from "react-icons/gr";
import { MdFavorite } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { selectAdmin } from "../../features/auth/authSelectors";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const admin = useSelector(selectAdmin);

  const [open, setOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const adminRole = admin?.role === "mother" ? "mother" : "sub";
  const permissions = Array.isArray(admin?.permissions)
    ? admin.permissions
    : [];
  const isMother = adminRole === "mother";

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

  const canAccess = (key) => {
    if (isMother) return true;
    return permissions.includes(key);
  };

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        to: "/",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        key: "__mother__",
        to: "/create-admin",
        icon: <GrUserAdmin />,
        text: "Create Admin",
      },
    ],
    [],
  );

  const userItems = useMemo(
    () => [
      { key: "all-users", to: "/all-users", icon: <FaUsers />, text: "Users" },
    ],
    [],
  );

  const depositItems = useMemo(
    () => [
      {
        key: "deposit-methods",
        to: "/deposit-methods",
        icon: <FaPlusCircle />,
        text: "Deposit Methods",
      },
      {
        key: "deposit-requests",
        to: "/deposit-requests",
        icon: <FaClipboardList />,
        text: "Deposit Requests",
      },
    ],
    [],
  );

  const withdrawItems = useMemo(
    () => [
      {
        key: "withdraw-methods",
        to: "/withdraw-methods",
        icon: <FaMoneyBillWave />,
        text: "Withdraw Methods",
      },
      {
        key: "withdraw-requests",
        to: "/withdraw-requests",
        icon: <FaWallet />,
        text: "Withdraw Requests",
      },
    ],
    [],
  );

  const contentItems = useMemo(
    () => [
      {
        key: "content-hollywood",
        to: "/content/hollywood",
        icon: <FaFilm />,
        text: "Hollywood",
      },
      {
        key: "content-horror",
        to: "/content/horror",
        icon: <FaFilm />,
        text: "Horror",
      },
      {
        key: "content-live-tv",
        to: "/content/live-tv",
        icon: <FaFilm />,
        text: "Live TV",
      },
      {
        key: "content-football",
        to: "/content/football",
        icon: <FaFilm />,
        text: "Football",
      },
      {
        key: "content-trending",
        to: "/content/trending",
        icon: <FaFilm />,
        text: "Trending",
      },
      {
        key: "content-top-ten",
        to: "/content/top-ten",
        icon: <FaFilm />,
        text: "Top Ten Movies",
      },
      {
        key: "content-free-movie",
        to: "/content/free-movie",
        icon: <FaFilm />,
        text: "Free Movies",
      },
      {
        key: "content-all-channel",
        to: "/content/all-channel",
        icon: <FaFilm />,
        text: "All Channels",
      },
      {
        key: "content-all-ott",
        to: "/content/all-ott",
        icon: <FaFilm />,
        text: "All OTT Platforms",
      },
      {
        key: "content-favorite-banner",
        to: "/content/favorite-banner",
        icon: <MdFavorite />,
        text: "Favorite Banner",
      },
    ],
    [],
  );

  const siteItems = useMemo(
    () => [
      {
        key: "site-sliders",
        to: "/site/sliders",
        icon: <FaSlidersH />,
        text: "Slider Control",
      },
      {
        key: "site-notices",
        to: "/site/notices",
        icon: <FaNotesMedical />,
        text: "Notice Control",
      },
      {
        key: "site-ads",
        to: "/site/ads",
        icon: <FaImage />,
        text: "Ads Images",
      },
      {
        key: "site-footer-setting",
        to: "/site/footer-setting",
        icon: <IoFootstepsOutline />,
        text: "Footer Setting",
      },
      {
        key: "site-social-link",
        to: "/site/social-link",
        icon: <FaShareAlt />,
        text: "Social Link",
      },
      {
        key: "site-why-us",
        to: "/site/why-us",
        icon: <FaGlobe />,
        text: "Why Us Setting",
      },
      {
        key: "site-identify",
        to: "/site/site-identify",
        icon: <FaGlobe />,
        text: "Site Identify",
      },
    ],
    [],
  );

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.key === "__mother__") return isMother;
      if (item.key === "dashboard") return true;
      return canAccess(item.key);
    });
  }, [menuItems, isMother, permissions]);

  const visibleUserItems = useMemo(
    () => userItems.filter((item) => canAccess(item.key)),
    [userItems, permissions, isMother],
  );

  const visibleDepositItems = useMemo(
    () => depositItems.filter((item) => canAccess(item.key)),
    [depositItems, permissions, isMother],
  );

  const visibleWithdrawItems = useMemo(
    () => withdrawItems.filter((item) => canAccess(item.key)),
    [withdrawItems, permissions, isMother],
  );

  const visibleContentItems = useMemo(
    () => contentItems.filter((item) => canAccess(item.key)),
    [contentItems, permissions, isMother],
  );

  const visibleSiteItems = useMemo(
    () => siteItems.filter((item) => canAccess(item.key)),
    [siteItems, permissions, isMother],
  );

  useEffect(() => {
    if (!visibleUserItems.length) setUsersOpen(false);
    if (!visibleDepositItems.length) setDepositOpen(false);
    if (!visibleWithdrawItems.length) setWithdrawOpen(false);
    if (!visibleContentItems.length) setContentOpen(false);
    if (!visibleSiteItems.length) setSiteOpen(false);
  }, [
    visibleUserItems.length,
    visibleDepositItems.length,
    visibleWithdrawItems.length,
    visibleContentItems.length,
    visibleSiteItems.length,
  ]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0b0e0f] text-white">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#312e81] via-[#8b5cf6] to-[#4338ca] px-4 py-3 flex items-center justify-between shadow-lg shadow-[#8b5cf6]/30 border-b border-[#8b5cf6]/20">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <h2 className="text-lg font-black text-white">Admin</h2>

        <NavLink to="/profile" className="cursor-pointer">
          <FaUserCircle className="text-2xl text-white hover:text-violet-200 transition-colors cursor-pointer" />
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
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-[#0b0e0f] via-[#120a24] to-[#0b0e0f] border-r border-[#8b5cf6]/20 shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-[#8b5cf6]/20 bg-gradient-to-r from-black/80 via-[#8b5cf6]/15 to-black/80 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/40">
                  <span className="text-white font-black text-3xl">B</span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    ADMIN
                  </h2>
                  <p className="text-sm text-violet-200/80 font-medium">
                    {isMother ? "Mother Panel" : "Sub Admin Panel"}
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
              {visibleMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-semibold transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] text-white shadow-lg shadow-[#8b5cf6]/30"
                        : "text-slate-200 hover:bg-[#8b5cf6]/15 hover:text-white"
                    }`
                  }
                >
                  <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </NavLink>
              ))}

              {visibleUserItems.length > 0 && (
                <DropdownSection
                  title="Users"
                  icon={<FaUserShield />}
                  open={usersOpen}
                  setOpen={setUsersOpen}
                  items={visibleUserItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleDepositItems.length > 0 && (
                <DropdownSection
                  title="Deposit"
                  icon={<FaWallet />}
                  open={depositOpen}
                  setOpen={setDepositOpen}
                  items={visibleDepositItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleWithdrawItems.length > 0 && (
                <DropdownSection
                  title="Withdraw"
                  icon={<FaMoneyBillWave />}
                  open={withdrawOpen}
                  setOpen={setWithdrawOpen}
                  items={visibleWithdrawItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleContentItems.length > 0 && (
                <DropdownSection
                  title="Movie & Content"
                  icon={<FaFilm />}
                  open={contentOpen}
                  setOpen={setContentOpen}
                  items={visibleContentItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleSiteItems.length > 0 && (
                <DropdownSection
                  title="Site Controller"
                  icon={<FaLayerGroup />}
                  open={siteOpen}
                  setOpen={setSiteOpen}
                  items={visibleSiteItems}
                  onClose={() => setOpen(false)}
                />
              )}
            </nav>

            <div className="p-5 border-t border-[#8b5cf6]/20 mt-auto shrink-0">
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-[#a855f7] to-[#7c3aed] rounded-xl text-white font-black transition-all duration-300 shadow-lg shadow-[#a855f7]/30 border border-[#a855f7]/30 hover:scale-[1.01]"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-5 border-b border-[#8b5cf6]/20 bg-gradient-to-r from-black/80 via-[#8b5cf6]/10 to-black/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b5cf6] text-lg" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-12 pr-5 py-3 bg-black/40 border border-[#8b5cf6]/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2.5 hover:bg-[#8b5cf6]/15 rounded-xl transition-colors cursor-pointer">
                <FaBell className="text-xl text-[#8b5cf6]" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#a855f7] rounded-full ring-2 ring-[#a855f7]/60"></span>
              </button>

              <NavLink
                to="/profile"
                className="p-1 hover:bg-[#8b5cf6]/15 rounded-full transition-colors cursor-pointer"
              >
                <FaUserCircle className="text-3xl text-[#8b5cf6]" />
              </NavLink>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto [scrollbar-width:none] bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_40%),linear-gradient(135deg,#0b0e0f,#0e0a1a,#0b0e0f)]">
            <div className="mt-16 md:mt-0 p-4 lg:p-6 text-white">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const DropdownSection = ({ title, icon, open, setOpen, items, onClose }) => {
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-slate-200 hover:bg-[#8b5cf6]/15 hover:text-white transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold">{title}</span>
        </div>

        {open ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-2 pl-10 space-y-1">
          {items.map((sub) => (
            <NavLink
              key={sub.to}
              to={sub.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] text-white font-bold shadow-md shadow-[#8b5cf6]/30"
                    : "text-slate-300 hover:text-white hover:bg-[#8b5cf6]/15"
                }`
              }
            >
              <span className="text-xl opacity-90">{sub.icon}</span>
              <span>{sub.text}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
