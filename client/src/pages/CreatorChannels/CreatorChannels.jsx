import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { api } from "../../api/axios";

const LIMIT = 24;

const CreatorChannels = () => {
  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      setLoading(true);

      api
        .get("/api/site/channels", {
          params: { search: search.trim() || undefined, page, limit: LIMIT },
        })
        .then(({ data }) => {
          if (cancelled) return;
          setChannels(data?.data?.channels || []);
          setTotalPages(data?.data?.totalPages || 1);
        })
        .catch(() => {
          if (!cancelled) setChannels([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, search]);

  const base = api.defaults.baseURL;

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-6 text-white sm:px-6 lg:px-10 xl:px-[42px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Creator Channels
        </h1>

        <div className="flex items-center rounded-xl border border-white/15 bg-white/[0.06] px-3">
          <Search size={17} className="shrink-0 text-white/50" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search channels..."
            className="h-10 min-w-0 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
          Loading...
        </div>
      ) : channels.length === 0 ? (
        <p className="py-16 text-center text-slate-400">No channels found.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              to={`/channel/${channel.id}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#16d6dc]/40 hover:bg-white/[0.06]"
            >
              {channel.logo ? (
                <img
                  src={`${base}${channel.logo}`}
                  alt={channel.name}
                  className="h-20 w-20 rounded-full border border-white/15 object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#16d6dc]/15 text-2xl font-black text-[#16d6dc]">
                  {channel.name?.[0]}
                </div>
              )}
              <p className="w-full truncate text-center text-sm font-semibold text-[#c9cdcf] group-hover:text-white">
                {channel.name}
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

export default CreatorChannels;
