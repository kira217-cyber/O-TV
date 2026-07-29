import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";

import { api } from "../../api/axios";

const LIMIT = 24;

const New = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      setLoading(true);

      api
        .get("/api/site/videos", { params: { sort: "newest", page, limit: LIMIT } })
        .then(({ data }) => {
          if (cancelled) return;
          setVideos(data?.data?.videos || []);
          setTotalPages(data?.data?.totalPages || 1);
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
  }, [page]);

  const base = api.defaults.baseURL;

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-6 text-white sm:px-6 lg:px-10 xl:px-[42px]">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        New Releases
      </h1>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
          Loading...
        </div>
      ) : videos.length === 0 ? (
        <p className="py-16 text-center text-slate-400">
          No videos have been published yet.
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

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/[0.06] text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-sm font-semibold text-slate-300">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/[0.06] text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default New;
