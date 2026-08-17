import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pin } from "lucide-react";
import { Link } from "react-router";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import LiveTvChannelCard from "../LiveTvChannelCard/LiveTvChannelCard";

import "swiper/css";

// One category section of the Live TV page: a horizontally sliding row of
// the channels an admin marked "show on list", matching the home page's
// Live TV row. When the category holds more than the row shows, "View All"
// opens the category's own page with every channel in it.
const LiveTvChannelRow = ({
  title,
  channels,
  selectedId,
  onSelect,
  pinned,
  viewAllTo,
}) => {
  const swiperRef = useRef(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavigation = (swiper) => {
    if (!swiper) return;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <section className="group/row mt-6 sm:mt-8">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <h3 className="flex min-w-0 items-center gap-2 text-base font-bold text-white sm:text-lg">
          {pinned && <Pin className="h-4 w-4 shrink-0 text-[#16d6dc]" />}
          <span className="truncate">{title}</span>
          <span className="shrink-0 text-xs font-semibold text-[#8b9295]">
            {channels.length}
          </span>
        </h3>

        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="flex shrink-0 cursor-pointer items-center gap-0.5 text-xs font-semibold text-[#c9cdcf] transition hover:text-[#16d6dc] sm:text-sm"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="live-tv-row-boundary relative">
          <Swiper
            modules={[Keyboard, A11y]}
            slidesPerView="auto"
            slidesPerGroup={1}
            spaceBetween={12}
            grabCursor
            watchOverflow
            keyboard={{ enabled: true }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              updateNavigation(swiper);
            }}
            onSlideChange={updateNavigation}
            onResize={updateNavigation}
            breakpoints={{
              640: { spaceBetween: 16 },
              1024: { spaceBetween: 20 },
            }}
            className="live-tv-row-swiper"
          >
            {channels.map((channel) => (
              <SwiperSlide key={channel._id} className="live-tv-row-slide">
                <LiveTvChannelCard
                  channel={channel}
                  isActive={selectedId === channel._id}
                  onSelect={onSelect}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {!isBeginning && (
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label={`Previous ${title} channels`}
              className="invisible absolute left-0 top-[38%] z-40 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#252c2e]/95 text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/row:visible group-hover/row:opacity-100 hover:scale-105 hover:bg-[#343c3e] lg:flex"
            >
              <ChevronLeft size={22} strokeWidth={1.8} />
            </button>
          )}

          {!isEnd && (
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label={`Next ${title} channels`}
              className="invisible absolute right-0 top-[38%] z-40 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#252c2e]/95 text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/row:visible group-hover/row:opacity-100 hover:scale-105 hover:bg-[#343c3e] lg:flex"
            >
              <ChevronRight size={22} strokeWidth={1.8} />
            </button>
          )}
      </div>

      <style>
        {`
          /* Nothing of the next channel may spill outside the column. */
          .live-tv-row-boundary,
          .live-tv-row-swiper {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
          }

          .live-tv-row-swiper .swiper-wrapper {
            align-items: flex-start;
          }

          /* Fixed slide widths so every row lines up with every other row,
             however many channels each one happens to hold. */
          .live-tv-row-slide {
            width: 88px;
          }

          @media (min-width: 480px) {
            .live-tv-row-slide {
              width: 100px;
            }
          }

          @media (min-width: 768px) {
            .live-tv-row-slide {
              width: 112px;
            }
          }

          @media (min-width: 1024px) {
            .live-tv-row-slide {
              width: 124px;
            }
          }
        `}
      </style>
    </section>
  );
};

export default LiveTvChannelRow;
