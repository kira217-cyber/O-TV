import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PlayCircle } from "lucide-react";

import { api } from "../../api/axios";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      if (!query.trim()) {
        setVideos([]);
        setChannels([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      Promise.all([
        api.get("/api/site/videos", { params: { search: query, limit: 40 } }),
        api.get("/api/site/channels", { params: { search: query, limit: 12 } }),
      ])
        .then(([videosRes, channelsRes]) => {
          if (cancelled) return;
          setVideos(videosRes.data?.data?.videos || []);
          setChannels(channelsRes.data?.data?.channels || []);
        })
        .catch(() => {
          if (!cancelled) {
            setVideos([]);
            setChannels([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const base = api.defaults.baseURL;

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-6 text-white sm:px-6 lg:px-10 xl:px-[42px]">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        Search results for &ldquo;{query}&rdquo;
      </h1>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
          Loading...
        </div>
      ) : !query.trim() ? (
        <p className="py-16 text-center text-slate-400">
          Type something in the search bar to get started.
        </p>
      ) : videos.length === 0 && channels.length === 0 ? (
        <p className="py-16 text-center text-slate-400">
          No results found for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <>
          {channels.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Channels
              </h2>

              <div className="flex flex-wrap gap-5">
                {channels.map((channel) => (
                  <Link
                    key={channel.id}
                    to={`/channel/${channel.id}`}
                    className="group flex w-24 flex-col items-center gap-2"
                  >
                    {channel.logo ? (
                      <img
                        src={`${base}${channel.logo}`}
                        alt={channel.name}
                        className="h-16 w-16 rounded-full border border-white/15 object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16d6dc]/15 text-xl font-black text-[#16d6dc]">
                        {channel.name?.[0]}
                      </div>
                    )}
                    <p className="w-full truncate text-center text-xs font-semibold text-[#c9cdcf] group-hover:text-white">
                      {channel.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Videos
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {videos.map((video) => (
                  <Link
                    key={video.id}
                    to={`/watch/${video.id}`}
                    className="group block cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#182023]">
                      <img
                        src={`${base}${video.thumbnail?.portrait}`}
                        alt={video.title}
                        className="h-full w-full select-none object-cover transition group-hover:scale-105"
                        draggable={false}
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
