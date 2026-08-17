import React from "react";
import { Radio } from "lucide-react";

import { api } from "../../api/axios";

// One channel on the Live TV page — the circular avatar used both inside a
// category slider and inside a "View All" grid, so a channel looks the
// same wherever it turns up. The cyan ring marks the channel currently
// playing in the player above.
const LiveTvChannelCard = ({ channel, isActive, onSelect }) => {
  const base = api.defaults.baseURL;

  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      title={channel.name}
      className="group flex w-full cursor-pointer flex-col items-center gap-2"
    >
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-full border p-1 shadow-[0_8px_22px_rgba(0,0,0,0.2)] transition ${
          isActive
            ? "border-[#16d6dc] bg-[#16d6dc]/10 shadow-[0_0_18px_rgba(22,214,220,0.3)]"
            : "border-white/15 bg-[#181d1f]"
        }`}
      >
        <div className="h-full w-full overflow-hidden rounded-full bg-black">
          {channel.logo ? (
            <img
              src={`${base}${channel.logo}`}
              alt={channel.name}
              draggable={false}
              loading="lazy"
              className="h-full w-full select-none rounded-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#16d6dc]">
              <Radio className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>

      <p
        className={`w-full truncate text-center text-[11px] font-semibold transition sm:text-xs ${
          isActive ? "text-[#16d6dc]" : "text-[#c9cdcf] group-hover:text-white"
        }`}
      >
        {channel.name}
      </p>
    </button>
  );
};

export default LiveTvChannelCard;
