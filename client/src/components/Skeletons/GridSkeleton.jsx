import React from "react";
import Skeleton from "react-loading-skeleton";

// Matches the portrait-card grid shape shared by CategoryVideosPage, New,
// SearchResults, and ChannelPage.
const GridSkeleton = ({
  count = 12,
  cols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
}) => (
  <div className={`mt-8 grid gap-4 ${cols}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index}>
        <div className="aspect-[2/3] w-full overflow-hidden rounded-[10px]">
          <Skeleton height="100%" />
        </div>
        <div className="mt-2">
          <Skeleton width="80%" height={12} />
        </div>
      </div>
    ))}
  </div>
);

export default GridSkeleton;
