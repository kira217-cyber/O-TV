import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Radio, Search } from "lucide-react";

import { api } from "../../api/axios";
import HlsPlayer from "../../components/HlsPlayer/HlsPlayer";
import ScheduledLiveTvPlayer from "../../components/ScheduledLiveTvPlayer/ScheduledLiveTvPlayer";
import CircleGridSkeleton from "../../components/Skeletons/CircleGridSkeleton";

const LIMIT = 48;

const LiveTvPage = () => {
  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      setLoading(true);

      api
        .get("/api/site/live-tv", {
          params: { search: search.trim() || undefined, page, limit: LIMIT },
        })
        .then(({ data }) => {
          if (cancelled) return;

          const loaded = data?.data?.channels || [];
          setChannels(loaded);
          setTotalPages(data?.data?.totalPages || 1);

          setSelectedChannel((current) => {
            if (current || loaded.length === 0) return current;
            // O-TV (the site's own channel) is the default landing view
            // when it exists — everything else is picked at random.
            const otv = loaded.find((channel) => channel.channelType === "scheduled");
            return otv || loaded[Math.floor(Math.random() * loaded.length)];
          });
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
    <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 pt-4 text-white sm:px-6 sm:pt-6 lg:px-10 xl:px-[42px]">
      <h1 className="hidden text-2xl font-bold text-white sm:block sm:text-3xl">
        Live TV
      </h1>

      {selectedChannel && (
        <div className="sm:mt-5">
          {selectedChannel.channelType === "scheduled" ? (
            <ScheduledLiveTvPlayer
              key={selectedChannel._id}
              channelId={selectedChannel._id}
              poster={
                selectedChannel.logo ? `${base}${selectedChannel.logo}` : undefined
              }
              title={selectedChannel.name}
              adsTarget={{ liveTv: selectedChannel._id }}
            />
          ) : (
            <HlsPlayer
              key={selectedChannel._id}
              src={selectedChannel.streamUrl}
              poster={
                selectedChannel.logo ? `${base}${selectedChannel.logo}` : undefined
              }
              title={selectedChannel.name}
              adsTarget={{ liveTv: selectedChannel._id }}
            />
          )}

          {/* "Now playing" bar — mobile only, matches the site's cyan theme */}
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#16d6dc]/25 bg-[#16d6dc]/[0.07] px-4 py-3 md:hidden">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#16d6dc] bg-black">
              {selectedChannel.logo ? (
                <img
                  src={`${base}${selectedChannel.logo}`}
                  alt={selectedChannel.name}
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
              <p className="truncate text-sm font-bold text-white">
                {selectedChannel.name}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#16d6dc]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16d6dc]" />
                Now Playing
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 sm:mt-8">
        <h2 className="text-lg font-bold text-white sm:text-xl">All Channels</h2>

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
        <CircleGridSkeleton
          count={16}
          cols="grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
        />
      ) : channels.length === 0 ? (
        <p className="py-16 text-center text-slate-400">No channels found.</p>
      ) : (
        <>
          {/* Mobile: rounded card grid */}
          <div className="mt-5 grid grid-cols-3 gap-3 md:hidden">
            {channels.map((channel) => {
              const isActive = selectedChannel?._id === channel._id;

              return (
                <button
                  key={channel._id}
                  type="button"
                  onClick={() => setSelectedChannel(channel)}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border p-2 transition ${
                    isActive
                      ? "border-[#16d6dc] bg-[#16d6dc]/10 shadow-[0_0_18px_rgba(22,214,220,0.25)]"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-black">
                    {channel.logo ? (
                      <img
                        src={`${base}${channel.logo}`}
                        alt={channel.name}
                        className="h-full w-full select-none object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#16d6dc]">
                        <Radio className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <p
                    className={`w-full truncate text-center text-[11px] font-semibold transition ${
                      isActive ? "text-[#16d6dc]" : "text-[#c9cdcf]"
                    }`}
                  >
                    {channel.name}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Desktop: unchanged circular avatar grid */}
          <div className="mt-6 hidden grid-cols-4 gap-4 md:grid md:grid-cols-6 lg:grid-cols-8">
            {channels.map((channel) => {
              const isActive = selectedChannel?._id === channel._id;

              return (
                <button
                  key={channel._id}
                  type="button"
                  onClick={() => setSelectedChannel(channel)}
                  className="group flex cursor-pointer flex-col items-center gap-2"
                >
                  <div
                    className={`relative aspect-square w-full overflow-hidden rounded-full border p-1 shadow-[0_8px_22px_rgba(0,0,0,0.2)] transition ${
                      isActive
                        ? "border-[#16d6dc] bg-[#16d6dc]/10"
                        : "border-white/15 bg-[#181d1f]"
                    }`}
                  >
                    <div className="h-full w-full overflow-hidden rounded-full bg-black">
                      {channel.logo ? (
                        <img
                          src={`${base}${channel.logo}`}
                          alt={channel.name}
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
                  <p
                    className={`w-full truncate text-center text-xs font-semibold transition ${
                      isActive ? "text-[#16d6dc]" : "text-[#c9cdcf] group-hover:text-white"
                    }`}
                  >
                    {channel.name}
                  </p>
                </button>
              );
            })}
          </div>
        </>
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

export default LiveTvPage;
