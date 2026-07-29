import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import Slider from "../components/Slider/Slider";

const RootLayout = () => {
  return (
    <div className="bg-[#111618]">
      <Navber />
      <div className="mt-22 md:mt-16">
        <Slider />
      </div>
      <Outlet />
      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default RootLayout;
