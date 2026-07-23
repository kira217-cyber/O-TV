import React from "react";
import { Flame, Home, UserRound } from "lucide-react";
import { PiFilmSlate } from "react-icons/pi";
import { NavLink } from "react-router";

const bottomNavItems = [
  {
    name: "Home",
    path: "/",
    icon: Home,
    type: "lucide",
  },
  {
    name: "Shorts",
    path: "/shorts",
    icon: PiFilmSlate,
    type: "react-icon",
  },
  {
    name: "New",
    path: "/new",
    icon: Flame,
    type: "lucide",
  },
  {
    name: "Account",
    path: "/account",
    icon: UserRound,
    type: "lucide",
  },
];

const BottomNavbar = () => {
  return (
    <>
      {/* Mobile-only bottom navbar */}
      <nav className="fixed inset-x-0 bottom-0 z-[9999] block border-t border-white/[0.06] bg-[#111618]/90 shadow-[0_-8px_25px_rgba(0,0,0,0.2)] backdrop-blur-xl md:hidden">
        <div className="grid h-[72px] grid-cols-4 items-center px-2 pb-[env(safe-area-inset-bottom)]">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                aria-label={item.name}
                className={({ isActive }) =>
                  [
                    "group relative flex h-full cursor-pointer",
                    "flex-col items-center justify-center gap-[4px]",
                    "transition-all duration-200",
                    isActive ? "text-white" : "text-[#d5d8d9] hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active background glow */}
                    <span
                      className={`pointer-events-none absolute left-1/2 top-1/2 h-[46px] w-[58px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-opacity duration-300 ${
                        isActive ? "bg-white/[0.09] opacity-100" : "opacity-0"
                      }`}
                    />

                    {/* Icon */}
                    <span
                      className={`relative z-10 flex h-[25px] items-center justify-center transition-transform duration-200 group-active:scale-90 ${
                        isActive ? "text-white" : "text-[#d5d8d9]"
                      }`}
                    >
                      {item.type === "react-icon" ? (
                        <Icon size={22} />
                      ) : (
                        <Icon
                          size={22}
                          strokeWidth={isActive ? 2.3 : 1.8}
                          fill={
                            item.name === "Home" && isActive
                              ? "currentColor"
                              : "none"
                          }
                        />
                      )}
                    </span>

                    {/* Label */}
                    <span
                      className={`relative z-10 text-[11px] leading-none ${
                        isActive ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {item.name}
                    </span>

                    {/* Active top indicator */}
                    <span
                      className={`absolute left-1/2 top-0 h-[2px] -translate-x-1/2 rounded-full bg-white transition-all duration-300 ${
                        isActive ? "w-8 opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Prevent page/footer content from hiding behind navbar */}
      <div aria-hidden="true" className="h-[72px] md:hidden" />
    </>
  );
};

export default BottomNavbar;
