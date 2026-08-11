import React from "react";
import Skeleton from "react-loading-skeleton";

// Matches the circular-avatar grid shape shared by CreatorChannels,
// LiveTvPage, and LiveTvWatch's related-channels row.
const CircleGridSkeleton = ({
  count = 24,
  cols = "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
}) => (
  <div className={`mt-8 grid gap-4 ${cols}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex flex-col items-center gap-2">
        <div className="aspect-square w-full overflow-hidden rounded-full">
          <Skeleton circle height="100%" />
        </div>
        <Skeleton width="60%" height={10} />
      </div>
    ))}
  </div>
);

export default CircleGridSkeleton;
