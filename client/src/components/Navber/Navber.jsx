import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, UserRound, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router";

const LOGO_URL =
  "https://asset.bioscopelive.com/uploads/images/2025/07/28/images_d6ce912746f794656d087b55ef04100d_goplay_bios.png?w=560";

const navItems = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Movies",
    path: "/movies",
  },
  {
    name: "Free",
    path: "/free",
  },
  {
    name: "Shows",
    path: "/shows",
  },
  {
    name: "Sports",
    path: "/sports",
  },
];

const Navber = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!searchOpen) return;

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = searchText.trim();

    if (!value) return;

    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const desktopNavClass = ({ isActive }) => {
    return [
      "relative flex h-full cursor-pointer items-center",
      "whitespace-nowrap text-[15px] font-semibold",
      "transition-colors duration-200",
      "hover:text-[#16d6dc]",
      "after:absolute after:bottom-0 after:left-1/2",
      "after:h-[2px] after:-translate-x-1/2",
      "after:bg-[#16d6dc]",
      "after:transition-all after:duration-300",
      isActive ? "text-[#16d6dc] after:w-full" : "text-white after:w-0",
    ].join(" ");
  };

  const mobileNavClass = ({ isActive }) => {
    return [
      "flex h-[30px] shrink-0 cursor-pointer",
      "items-center justify-center rounded-full px-[13px]",
      "whitespace-nowrap text-[12px] font-semibold",
      "transition-all duration-200",
      isActive
        ? "bg-white text-[#111618]"
        : "bg-[#343a3c] text-white hover:bg-[#454c4e]",
    ].join(" ");
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[9999] transition-all duration-300 ${
          scrolled
            ? "bg-[#111618]/95 backdrop-blur-xl"
            : " bg-[#111618]"
        }`}
      >
        {/* ================= DESKTOP NAVBAR ================= */}
        <div className="mx-auto hidden h-[68px] w-full max-w-[1680px] items-center justify-between px-10 lg:flex xl:px-[106px]">
          {/* Desktop logo */}
          <NavLink
            to="/"
            aria-label="O-TV Home"
            className="flex shrink-0 cursor-pointer items-center"
          >
            <img
              src={LOGO_URL}
              alt="O-TV"
              draggable={false}
              className="h-auto w-[162px] select-none object-contain"
            />
          </NavLink>

          {/* Desktop navigation */}
          <nav className="flex h-full items-center gap-8 xl:gap-9">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={desktopNavClass}
              >
                {item.name}
              </NavLink>
            ))}

            <NavLink to="/fifa-world-cup-2026" className={desktopNavClass}>
              <span className="mr-2 text-[15px]" aria-hidden="true">
                ⚽
              </span>

              <span>
                FIFA World Cup 2026
                <sup className="ml-[1px] text-[8px]">TM</sup>
              </span>
            </NavLink>
          </nav>

          {/* Desktop actions */}
          <div className="flex shrink-0 items-center gap-5">
            <button
              type="button"
              onClick={() => setSearchOpen((previous) => !previous)}
              aria-label="Search"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 hover:text-[#16d6dc]"
            >
              <Search size={22} strokeWidth={1.8} />
            </button>

            <NavLink
              to="/login"
              className="flex h-[38px] cursor-pointer items-center gap-2 rounded-[9px] border border-white px-4 text-[15px] font-semibold text-white transition-all duration-200 hover:border-[#16d6dc] hover:bg-[#16d6dc] hover:text-[#111618]"
            >
              <UserRound size={18} strokeWidth={1.7} />
              <span>Login</span>
            </NavLink>
          </div>
        </div>

        {/* ================= MOBILE NAVBAR ================= */}
        <div className="block overflow-hidden lg:hidden">
          {/* Mobile first row */}
          <div className="flex h-[48px] items-center justify-between px-[18px]">
            {/* Mobile logo */}
            <NavLink
              to="/"
              aria-label="O-TV Home"
              className="flex shrink-0 cursor-pointer items-center"
            >
              <img
                src={LOGO_URL}
                alt="O-TV"
                draggable={false}
                className="h-auto w-[145px] select-none object-contain"
              />
            </NavLink>

            {/* Mobile right actions */}
            <div className="flex shrink-0 items-center gap-[10px]">
              <button
                type="button"
                onClick={() => setSearchOpen((previous) => !previous)}
                aria-label="Search"
                className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                <Search size={21} strokeWidth={1.7} />
              </button>

              <NavLink
                to="/login"
                className="flex h-[31px] cursor-pointer items-center gap-[7px] rounded-[8px] border border-white px-[10px] text-[12px] font-semibold text-white transition-all duration-200 hover:border-[#16d6dc] hover:bg-[#16d6dc] hover:text-[#111618]"
              >
                <UserRound size={17} strokeWidth={1.7} />
                <span>Login</span>
              </NavLink>
            </div>
          </div>

          {/* Mobile second row */}
          <div className="relative h-[43px]">
            <nav className="mobile-navbar-scroll flex h-full items-start gap-[7px] overflow-x-auto px-[18px] pb-[10px] pt-[2px]">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={mobileNavClass}
                >
                  {item.name}
                </NavLink>
              ))}

              <NavLink to="/fifa-world-cup-2026" className={mobileNavClass}>
                <span className="mr-[5px] text-[11px]" aria-hidden="true">
                  ⚽
                </span>

                <span>
                  FIFA World Cup 2026
                  <sup className="ml-[1px] text-[7px]">TM</sup>
                </span>
              </NavLink>
            </nav>

            {/* Right side fade */}
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-7 bg-gradient-to-l from-[#111618] to-transparent" />
          </div>
        </div>

        {/* ================= SEARCH PANEL ================= */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.2,
              }}
              className="absolute left-0 top-full w-full border-t border-white/10 bg-[#111618]/95 px-4 py-3 shadow-xl backdrop-blur-xl sm:py-4"
            >
              <form
                onSubmit={handleSearch}
                className="mx-auto flex max-w-[720px] items-center rounded-xl border border-white/15 bg-white/[0.07] px-3 transition-colors focus-within:border-[#16d6dc] sm:px-4"
              >
                <Search
                  size={19}
                  strokeWidth={1.8}
                  className="shrink-0 text-white/60"
                />

                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search movies, shows and sports..."
                  className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-white/45 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hide mobile horizontal scrollbar */}
      <style>
        {`
          .mobile-navbar-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
            -webkit-overflow-scrolling: touch;
          }

          .mobile-navbar-scroll::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </>
  );
};

export default Navber;
