import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Radio } from "lucide-react";

import { api } from "../../api/axios";
import HlsPlayer from "../../components/HlsPlayer/HlsPlayer";
import PlayerSkeleton from "../../components/Skeletons/PlayerSkeleton";

const LiveTvWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChannel = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/site/live-tv/${id}`);
        setChannel(data?.data?.channel || null);
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

  if (loading) {
    return <PlayerSkeleton />;
  }

  if (!channel) return null;

  const base = api.defaults.baseURL;

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-4 text-white sm:px-6 lg:px-10 xl:px-[42px]">
      <div className="pt-5">
        <HlsPlayer
          key={channel._id}
          src={channel.streamUrl}
          poster={channel.logo ? `${base}${channel.logo}` : undefined}
          title={channel.name}
        />
      </div>

      <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
        {channel.name}
      </h1>

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Related channels
          </h2>

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {related.map((item) => (
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
