import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet, useLocation } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import Slider from "../components/Slider/Slider";

const RootLayout = () => {
  const location = useLocation();
  const isShortsPage = location.pathname.startsWith("/shorts");
  const showSlider = !isShortsPage && !location.pathname.startsWith("/watch/");

  if (isShortsPage) {
    return (
      <div className="bg-[#111618]">
        <Outlet />
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
