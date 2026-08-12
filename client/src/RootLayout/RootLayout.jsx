import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet, useLocation } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import Slider from "../components/Slider/Slider";
import LiveTvMobileHeader from "../components/LiveTvMobileHeader/LiveTvMobileHeader";

const RootLayout = () => {
  const location = useLocation();
  const isShortsPage = location.pathname.startsWith("/shorts");
  const isLiveTvPage = location.pathname.startsWith("/live-tv");
  const NO_SLIDER_PAGES = [
    "/watch/",
    "/terms-of-use",
    "/privacy-policy",
    "/faq",
    "/feedback",
    "/contact-us",
  ];
  const showSlider =
    !isShortsPage &&
    !isLiveTvPage &&
    !NO_SLIDER_PAGES.some((path) => location.pathname.startsWith(path));

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
