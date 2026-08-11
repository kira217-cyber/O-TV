import React from "react";
import Skeleton from "react-loading-skeleton";

// Matches the "title + horizontal circle row" shape shared by AllChannel,
// FavoriteHero, and LiveTv.
const CircleRowSkeleton = ({ count = 8, size = 130 }) => (
  <section className="w-full overflow-hidden bg-[#111618] py-5 text-white sm:py-7 lg:py-8">
    <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
      <Skeleton width={180} height={28} />

      <div className="mt-4 flex gap-4 overflow-hidden sm:mt-5">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex shrink-0 flex-col items-center gap-2"
            style={{ width: size }}
          >
            <Skeleton circle width={size} height={size} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CircleRowSkeleton;
