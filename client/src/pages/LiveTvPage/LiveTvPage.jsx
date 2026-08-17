import React, { useEffect, useMemo, useState } from "react";
import { Radio, Search } from "lucide-react";

import { api } from "../../api/axios";
import HlsPlayer from "../../components/HlsPlayer/HlsPlayer";
import ScheduledLiveTvPlayer from "../../components/ScheduledLiveTvPlayer/ScheduledLiveTvPlayer";
import CircleGridSkeleton from "../../components/Skeletons/CircleGridSkeleton";
import LiveTvChannelRow from "../../components/LiveTvChannelRow/LiveTvChannelRow";
import ViewerStats from "../../components/ViewerStats/ViewerStats";
import { useLiveTvAvailability } from "../../hooks/useLiveTvAvailability";

// The page shows every channel at once, grouped into category sections, so
// it asks for the whole list rather than a page of it — splitting a
// category across pages would break the grouping. Searching then filters
// what's already loaded, with no extra request.
const LIMIT = 500;

const PINNED_SECTION_KEY = "__pinned";
const OTHER_SECTION_KEY = "__other";

// The pinned row is a shortcut, not a second full listing — past ten it
// stops being one and the category sections below cover the rest.
const MAX_PINNED = 10;

const LiveTvPage = () => {
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    // Runs once on mount and `loading` already starts true, so there's
    // nothing to flip on the way in — only off in `finally`.
    let cancelled = false;

    api
      .get("/api/site/live-tv", { params: { limit: LIMIT } })
      .then(({ data }) => {
        if (cancelled) return;

        const loaded = data?.data?.channels || [];
        setChannels(loaded);
        setCategories(data?.data?.categories || []);

        setSelectedChannel((current) => {
          if (current || loaded.length === 0) return current;
          // Pipra-TV (the site's own channel) is the default landing view
          // when it exists — everything else is picked at random.
          const own = loaded.find((channel) => channel.channelType === "scheduled");
          return own || loaded[Math.floor(Math.random() * loaded.length)];
        });
      })
      .catch(() => {
        if (!cancelled) setChannels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Channels whose stream failed its check are dropped from the page
  // entirely, so nobody has to click one to find out it's dead.
  const { isAvailable, markUnavailable } = useLiveTvAvailability(channels);

  const visibleChannels = useMemo(
    () => channels.filter(isAvailable),
    [channels, isAvailable],
  );

  // Pinned first, then one section per category in the order admin defined,
  // then anything still uncategorised. A channel deliberately shows up in
  // every category it was given, and stays in them when pinned too —
  // pinning is a shortcut to the top, not a move.
  const sections = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matching = query
      ? visibleChannels.filter((channel) =>
          channel.name?.toLowerCase().includes(query),
        )
      : visibleChannels;

    const result = [];

    const pinned = matching.filter((channel) => channel.pinned);
    if (pinned.length > 0) {
      result.push({
        key: PINNED_SECTION_KEY,
        title: "Pinned Channels",
        channels: pinned.slice(0, MAX_PINNED),
      });
    }

    categories.forEach((category) => {
      const inCategory = matching.filter((channel) =>
        channel.categories?.includes(category.key),
      );

      if (inCategory.length === 0) return;

      // The row shows what admin ticked "show on list" for. If nothing is
      // ticked yet the category would otherwise render empty, so fall back
      // to its first few — a category with channels in it should never
      // look empty just because that step was skipped.
      const onList = inCategory.filter((channel) => channel.showOnList);
      const shown = (onList.length > 0 ? onList : inCategory).slice(0, MAX_PINNED);

      result.push({
        key: category.key,
        title: category.label,
        channels: shown,
        // Only worth a "View All" when the page isn't already showing
        // everything the category holds.
        viewAllTo:
          inCategory.length > shown.length
            ? `/live-tv/category/${category.key}`
            : null,
      });
    });

    // Pipra-TV is the site's own channel and never belongs in a catch-all
    // bucket — with no category it simply doesn't appear in the listings,
    // only in the pinned row (and as the default the player opens on).
    const other = matching.filter(
      (channel) =>
        channel.channelType !== "scheduled" && !channel.categories?.length,
    );
    if (other.length > 0) {
      result.push({
        key: OTHER_SECTION_KEY,
        title: "Other Channels",
        channels: other,
      });
    }

    return result;
  }, [visibleChannels, categories, search]);

  const base = api.defaults.baseURL;

  return (
    <div className="player-frame mx-auto w-full max-w-[1680px] px-4 pb-16 pt-4 text-white sm:px-6 sm:pt-6 lg:px-10 xl:px-[42px]">
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
              onUnavailable={markUnavailable}
            />
          )}

          {/* "Now playing" bar — matches the site's cyan theme */}
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#16d6dc]/25 bg-[#16d6dc]/[0.07] px-4 py-3">
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

            <ViewerStats id={selectedChannel._id} />
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
            onChange={(event) => setSearch(event.target.value)}
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
      ) : sections.length === 0 ? (
        <p className="py-16 text-center text-slate-400">No channels found.</p>
      ) : (
        sections.map((section) => (
          <LiveTvChannelRow
            key={section.key}
            title={section.title}
            channels={section.channels}
            viewAllTo={section.viewAllTo}
            pinned={section.key === PINNED_SECTION_KEY}
            selectedId={selectedChannel?._id}
            onSelect={setSelectedChannel}
          />
        ))
      )}
    </div>
  );
};

export default LiveTvPage;
