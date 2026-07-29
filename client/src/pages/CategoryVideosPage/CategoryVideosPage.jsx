import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { PlayCircle, Shuffle } from "lucide-react";

import { api } from "../../api/axios";

const CategoryVideosPage = ({ category, title }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      setLoading(true);

      api
        .get("/api/site/videos", {
          params: { category, sort: "random", limit: 48 },
        })
        .then(({ data }) => {
          if (!cancelled) setVideos(data?.data?.videos || []);
        })
        .catch(() => {
          if (!cancelled) setVideos([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [category, reloadKey]);

  const base = api.defaults.baseURL;

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-6 text-white sm:px-6 lg:px-10 xl:px-[42px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>

        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
          Loading...
        </div>
      ) : videos.length === 0 ? (
        <p className="py-16 text-center text-slate-400">
          No videos found in this category yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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
      )}
    </div>
  );
};

export default CategoryVideosPage;
