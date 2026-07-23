import React from "react";
import Slider from "../../components/Slider/Slider";
import Trending from "../../components/Trending/Trending";
import FreeMovie from "../../components/FreeMovie/FreeMovie";
import TopTenMovie from "../../components/TopTenMovie/TopTenMovie";
import AdsImage from "../../components/AdsImage/AdsImage";
import AllOTTPlatForms from "../../components/AllOTTPlatForms/AllOTTPlatForms";
import AllChannel from "../../components/AllChannel/AllChannel";
import LiveTv from "../../components/LiveTv/LiveTv";
import Football from "../../components/Football/Football";
import FavoriteHero from "../../components/FavoriteHero/FavoriteHero";
import Hollywood from "../../components/Hollywood/Hollywood";
import AdsImage2 from "../../components/AdsImage2/AdsImage2";
import Horror from "../../components/Horror/Horror";

const Home = () => {
  return (
    <div className="mt-22 md:mt-16">
      <Slider />
      <Trending />
      <FreeMovie />
      <AdsImage />
      <TopTenMovie />
      <AllOTTPlatForms />
      <AllChannel />
      <Football />
      <LiveTv />
      <Hollywood />
      <FavoriteHero />
      <Horror/>
      <AdsImage2 />
    </div>
  );
};

export default Home;
