import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";

const RootLayout = () => {
  return (
    <div className="">
      <Navber />
      <Outlet />
      <Footer />
      <BottomNavbar />
    </div>
  );
};

export default RootLayout;
