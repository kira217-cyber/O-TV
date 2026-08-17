import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Radio } from "lucide-react";

import { api } from "../../api/axios";
import HlsPlayer from "../../components/HlsPlayer/HlsPlayer";
import ScheduledLiveTvPlayer from "../../components/ScheduledLiveTvPlayer/ScheduledLiveTvPlayer";
import PlayerSkeleton from "../../components/Skeletons/PlayerSkeleton";
import ViewerStats from "../../components/ViewerStats/ViewerStats";
import { useLiveTvAvailability } from "../../hooks/useLiveTvAvailability";

const LiveTvWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChannel = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/site/live-tv/${id}`);
        setChannel(data?.data?.channel || null);
        setNowPlaying(data?.data?.nowPlaying || null);
        setRelated(data?.data?.related || []);
      } catch {
        navigate("/live-tv", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
    window.scrollTo({ top: 0 });
  }, [id, navigate]);

  // Same rule as the Live TV page — a related channel whose stream is down
  // is never offered as somewhere to go next.
  const { isAvailable, markUnavailable } = useLiveTvAvailability(related);

  const visibleRelated = useMemo(
    () => related.filter(isAvailable),
    [related, isAvailable],
  );

  if (loading) {
    return <PlayerSkeleton />;
  }

  if (!channel) return null;

  const base = api.defaults.baseURL;

  return (
    <div className="player-frame mx-auto w-full max-w-[1680px] px-4 pb-16 pt-4 text-white sm:px-6 lg:px-10 xl:px-[42px]">
      <div className="pt-5">
        {channel.channelType === "scheduled" ? (
          <ScheduledLiveTvPlayer
            key={channel._id}
            channelId={channel._id}
            initialNowPlaying={nowPlaying}
            poster={channel.logo ? `${base}${channel.logo}` : undefined}
            title={channel.name}
            adsTarget={{ liveTv: channel._id }}
          />
        ) : (
          <HlsPlayer
            key={channel._id}
            src={channel.streamUrl}
            poster={channel.logo ? `${base}${channel.logo}` : undefined}
            title={channel.name}
            adsTarget={{ liveTv: channel._id }}
            onUnavailable={markUnavailable}
          />
        )}
      </div>

      {/* "Now playing" bar — identical to the one on the Live TV page, so
          the channel you're watching is identified the same way wherever
          you opened it from. */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#16d6dc]/25 bg-[#16d6dc]/[0.07] px-4 py-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#16d6dc] bg-black">
          {channel.logo ? (
            <img
              src={`${base}${channel.logo}`}
              alt={channel.name}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#16d6dc]">
              <Radio className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-white sm:text-base">
            {channel.name}
          </h1>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#16d6dc]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16d6dc]" />
            Now Playing
          </p>
        </div>

        <ViewerStats id={channel._id} />
      </div>

      {visibleRelated.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Related channels
          </h2>

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {visibleRelated.map((item) => (
              <Link
                key={item._id}
                to={`/live-tv/${item._id}`}
                className="group flex flex-col items-center gap-2"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-full border border-white/15 bg-[#181d1f] p-1 shadow-[0_8px_22px_rgba(0,0,0,0.2)]">
                  <div className="h-full w-full overflow-hidden rounded-full bg-black">
                    {item.logo ? (
                      <img
                        src={`${base}${item.logo}`}
                        alt={item.name}
                        className="h-full w-full select-none rounded-full object-cover transition group-hover:scale-105"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#16d6dc]">
                        <Radio className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="w-full truncate text-center text-xs font-semibold text-[#c9cdcf] group-hover:text-white">
                  {item.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTvWatch;
