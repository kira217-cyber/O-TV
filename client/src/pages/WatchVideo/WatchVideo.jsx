import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Clock, Film, ShieldAlert } from "lucide-react";

import { api } from "../../api/axios";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import PlayerSkeleton from "../../components/Skeletons/PlayerSkeleton";

const WatchVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [moreFromChannel, setMoreFromChannel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/site/videos/${id}`);
        setVideo(data?.data?.video || null);
        setMoreFromChannel(data?.data?.moreFromChannel || []);
      } catch {
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
    window.scrollTo({ top: 0 });
  }, [id, navigate]);

  if (loading) {
    return <PlayerSkeleton />;
  }

  if (!video) return null;

  const base = api.defaults.baseURL;

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-4 text-white sm:px-6 lg:px-10 xl:px-[42px]">
      <div className="pt-5">
        <VideoPlayer
          src={video.video?.url}
          poster={`${base}${video.thumbnail?.landscape}`}
          title={video.title}
        />
      </div>

      <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
        {video.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 rounded-full bg-[#16d6dc]/10 px-3 py-1.5 font-bold text-[#5eeaf2]">
          <Clock className="h-3.5 w-3.5" />
          {video.duration}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#16d6dc]/10 px-3 py-1.5 font-bold text-[#5eeaf2]">
          <Film className="h-3.5 w-3.5" />
          {video.category}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#16d6dc]/10 px-3 py-1.5 font-bold text-[#5eeaf2]">
          <ShieldAlert className="h-3.5 w-3.5" />
          {video.maturityRating}
        </span>

        {video.studioUser?.channel?.name && (
          <Link
            to={`/channel/${video.studioUser.id}`}
            className="cursor-pointer text-sm font-semibold text-slate-300 underline-offset-2 hover:text-[#16d6dc] hover:underline"
          >
            {video.studioUser.channel.name}
          </Link>
        )}
      </div>

      {video.description && (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
          {video.description}
        </p>
      )}

      {moreFromChannel.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-white">
            More from this channel
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {moreFromChannel.map((item) => (
              <Link
                key={item._id}
                to={`/watch/${item._id}`}
                className="group block cursor-pointer"
              >
                <div className="aspect-[2/3] w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#182023]">
                  <img
                    src={`${base}${item.thumbnail?.portrait}`}
                    alt={item.title}
                    className="h-full w-full select-none object-cover transition group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 truncate text-xs font-semibold text-[#c9cdcf] group-hover:text-white">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchVideo;
