import React from "react";
import { NavLink } from "react-router";

import { api } from "../../api/axios";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import defaultLogo from "../../assets/pipra-tv-logo.png";

const DEFAULT_LOGO_URL = defaultLogo;

// Minimal top bar shown instead of the full Navber on mobile only, for the
// immersive Live TV page — no nav links, no login button, just the logo and
// a live indicator, matching how a dedicated TV-viewing screen should feel.
const LiveTvMobileHeader = () => {
  const { settings } = useSiteSettings();
  const logoUrl = settings?.logo
    ? `${api.defaults.baseURL}${settings.logo}`
    : DEFAULT_LOGO_URL;

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] flex h-13 items-center justify-between border-b border-white/[0.06] bg-[#111618]/95 px-4 backdrop-blur-xl md:hidden">
      <NavLink to="/" aria-label="Pipra-TV Home" className="flex shrink-0 items-center">
        <img
          src={logoUrl}
          alt="Pipra-TV"
          draggable={false}
          className="h-auto w-[120px] select-none object-contain"
        />
      </NavLink>

      <span className="flex items-center gap-1.5 rounded-full bg-[#dc1616]/30 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#ff0000]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff0000]" />
        LIVE
      </span>
    </header>
  );
};

export default LiveTvMobileHeader;
