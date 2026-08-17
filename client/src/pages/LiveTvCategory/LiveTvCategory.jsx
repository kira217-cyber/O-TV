import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { api } from "../../api/axios";
import CircleGridSkeleton from "../../components/Skeletons/CircleGridSkeleton";
import LiveTvChannelCard from "../../components/LiveTvChannelCard/LiveTvChannelCard";
import { useLiveTvAvailability } from "../../hooks/useLiveTvAvailability";

// Where a category row's "View All" leads: every channel in that category,
// not just the handful the row had room for. Picking one here opens it on
// the watch page and starts playing.
const LiveTvCategory = () => {
  const { key } = useParams();
  const navigate = useNavigate();

  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/site/live-tv", { params: { limit: 500 } })
      .then(({ data }) => {
        if (cancelled) return;
        setChannels(data?.data?.channels || []);
        setCategories(data?.data?.categories || []);
      })
      .catch(() => {
        if (!cancelled) setChannels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    window.scrollTo({ top: 0 });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const { isAvailable } = useLiveTvAvailability(channels);

  const title =
    categories.find((entry) => entry.key === key)?.label || "Live TV Channels";

  const categoryChannels = useMemo(
    () =>
      channels.filter(
        (channel) => channel.categories?.includes(key) && isAvailable(channel),
      ),
    [channels, key, isAvailable],
  );

  return (
    <div className="player-frame mx-auto w-full max-w-[1680px] px-4 pb-16 pt-4 text-white sm:px-6 sm:pt-6 lg:px-10 xl:px-[42px]">
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-[#1c2426] px-4 py-4 sm:mb-8">
        <button
          type="button"
          onClick={() => navigate("/live-tv")}
          aria-label="Back to Live TV"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition hover:bg-white/10 hover:text-[#16d6dc]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <h1 className="min-w-0 flex-1 truncate pr-9 text-center text-xl font-bold text-white sm:text-2xl">
          {title}
        </h1>
      </div>

      {loading ? (
        <CircleGridSkeleton
          count={18}
          cols="grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
        />
      ) : categoryChannels.length === 0 ? (
        <p className="py-16 text-center text-slate-400">
          No channels in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-8">
          {categoryChannels.map((channel) => (
            <LiveTvChannelCard
              key={channel._id}
              channel={channel}
              isActive={false}
              onSelect={(picked) => navigate(`/live-tv/${picked._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveTvCategory;
