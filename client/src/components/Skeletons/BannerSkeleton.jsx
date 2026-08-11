import React from "react";
import Skeleton from "react-loading-skeleton";

// Matches the Slider section's large rounded hero banner.
const BannerSkeleton = () => (
  <section className="relative w-full overflow-hidden bg-[#111618] py-[10px] lg:py-[11px]">
    <div className="mx-auto h-[min(119vw,500px)] w-[80%] sm:h-[clamp(400px,80vw,570px)] sm:w-[76%] md:w-[70%] lg:h-[clamp(500px,33.5vw,645px)] lg:w-[60%]">
      <Skeleton height="100%" borderRadius={17} />
    </div>
  </section>
);

export default BannerSkeleton;
