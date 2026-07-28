import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { PlayCircle } from "lucide-react";

import { api } from "../../api/axios";

const ChannelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChannel = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/site/channels/${id}`);
        setChannel(data?.data?.channel || null);
        setVideos(data?.data?.videos || []);
      } catch {
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
    window.scrollTo({ top: 0 });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mt-22 flex min-h-[50vh] items-center justify-center text-slate-400 md:mt-16">
        Loading...
      </div>
    );
  }

  if (!channel) return null;

  const base = api.defaults.baseURL;

  return (
    <div className="mt-22 mx-auto w-full max-w-[1680px] px-4 pb-16 text-white sm:px-6 md:mt-16 lg:px-10 xl:px-[42px]">
      <div className="flex items-center gap-4 pt-8">
        {channel.logo ? (
          <img
            src={`${base}${channel.logo}`}
            alt={channel.name}
            className="h-20 w-20 shrink-0 rounded-full border border-white/15 object-cover sm:h-24 sm:w-24"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#16d6dc]/15 text-2xl font-black text-[#16d6dc] sm:h-24 sm:w-24">
            {channel.name?.[0]}
          </div>
        )}

        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {channel.name}
        </h1>
      </div>

      <div className="mt-8">
        {videos.length === 0 ? (
          <p className="py-16 text-center text-slate-400">
            This channel hasn't published any videos yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {videos.map((video) => (
              <Link
                key={video._id}
                to={`/watch/${video._id}`}
                className="group block cursor-pointer"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#182023]">
                  <img
                    src={`${base}${video.thumbnail?.portrait}`}
                    alt={video.title}
                    className="h-full w-full select-none object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <PlayCircle className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                </div>
                <p className="mt-2 truncate text-xs font-semibold text-[#c9cdcf] group-hover:text-white">
                  {video.title}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
