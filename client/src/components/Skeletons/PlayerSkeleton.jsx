import React from "react";
import Skeleton from "react-loading-skeleton";

// Matches WatchVideo/LiveTvWatch: player frame + title + meta chips.
const PlayerSkeleton = () => (
  <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-4 text-white sm:px-6 lg:px-10 xl:px-[42px]">
    <div className="pt-5">
      <div className="aspect-video w-full overflow-hidden rounded-[28px]">
        <Skeleton height="100%" />
      </div>
    </div>

    <div className="mt-5">
      <Skeleton width="45%" height={30} />
    </div>

    <div className="mt-3 flex flex-wrap gap-3">
      <Skeleton width={90} height={28} borderRadius={999} />
      <Skeleton width={90} height={28} borderRadius={999} />
      <Skeleton width={90} height={28} borderRadius={999} />
    </div>

    <div className="mt-4 max-w-3xl">
      <Skeleton count={2} />
    </div>
  </div>
);

export default PlayerSkeleton;
