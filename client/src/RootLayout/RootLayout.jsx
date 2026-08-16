import React, { useEffect } from "react";
import Navber from "../components/Navber/Navber";
import { Outlet, useLocation } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import Slider from "../components/Slider/Slider";
import LiveTvMobileHeader from "../components/LiveTvMobileHeader/LiveTvMobileHeader";
import { getPresenceSocket } from "../hooks/presenceSocket";

const RootLayout = () => {
  const location = useLocation();

  // Reports "currently browsing <path>" to the live Site Analytics
  // dashboard in admin — connects the shared socket immediately (not just
  // when a video/live-tv player mounts) so browsing-only visitors show up
  // there too, and re-reports on every route change.
  useEffect(() => {
    getPresenceSocket().emit("page:view", { path: location.pathname });
  }, [location.pathname]);

  const isShortsPage = location.pathname.startsWith("/shorts");
  const isLiveTvPage = location.pathname.startsWith("/live-tv");
  const isPrivatePage =
    location.pathname.startsWith("/private-video") ||
    location.pathname.startsWith("/private-user-login");
  const NO_SLIDER_PAGES = [
    "/watch/",
    "/terms-of-use",
    "/privacy-policy",
    "/faq",
    "/feedback",
    "/contact-us",
    "/channel/",
    "/creator-channels",
  ];
  const showSlider =
    !isShortsPage &&
    !isLiveTvPage &&
    !NO_SLIDER_PAGES.some((path) => location.pathname.startsWith(path));

  // The private-video system is a self-contained section with its own
  // header/branding (see PrivateHeader) — it never shows the public site's
  // Navber, hero Slider, Footer, or BottomNavbar.
  if (isPrivatePage) {
    return (
      <div className="min-h-screen bg-[#0b0f10]">
        <Outlet />
      </div>
    );
  }

  if (isShortsPage) {
    return (
      <div className="bg-[#111618]">
        <Outlet />
        <BottomNavbar />
      </div>
    );
  }

  // Mobile gets a minimal logo-only header and no footer for an immersive,
  // uncluttered TV-viewing screen; desktop keeps the full Navber/Footer.
  if (isLiveTvPage) {
    return (
      <div className="bg-[#111618]">
        <div className="md:hidden">
          <LiveTvMobileHeader />
        </div>
        <div className="hidden md:block">
          <Navber />
        </div>
        <div className="mt-13 md:mt-16">
          <Outlet />
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="bg-[#111618]">
      <Navber />
      <div className="mt-22 md:mt-16">{showSlider && <Slider />}</div>
      <Outlet />
      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default RootLayout;
