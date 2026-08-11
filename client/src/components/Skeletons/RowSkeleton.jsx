import React from "react";
import Skeleton from "react-loading-skeleton";

// Matches the "title + horizontal card row" shape shared by Trending,
// FreeMovie, Hollywood, Horror, Football, AllOTTPlatForms, and TopTenMovie.
const RowSkeleton = ({ count = 7, cardWidth = 190, cardHeight = 280 }) => (
  <section className="w-full overflow-hidden bg-[#111618] py-5 text-white sm:py-7 lg:py-8">
    <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
      <Skeleton width={220} height={28} />

      <div className="mt-4 flex gap-3 overflow-hidden sm:mt-5 sm:gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="shrink-0" style={{ width: cardWidth }}>
            <Skeleton height={cardHeight} borderRadius={10} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default RowSkeleton;
