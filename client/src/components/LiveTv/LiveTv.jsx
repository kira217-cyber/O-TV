import React, { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useSiteSettings } from "../../hooks/useSiteSettings";
import { api } from "../../api/axios";
import CircleRowSkeleton from "../Skeletons/CircleRowSkeleton";
import EmptySection from "../EmptySection/EmptySection";

import "swiper/css";

const LiveTv = () => {
  const swiperRef = useRef(null);

  const { settings, loading: settingsLoading } = useSiteSettings();
  const sectionTitle = settings?.homeSections?.liveTv?.title || "Live TV";

  const realChannels = settings?.liveTv || [];
  const displayedChannels = useMemo(
    () =>
      realChannels.map((channel) => ({
        id: channel._id,
        name: channel.name,
        image: channel.logo ? `${api.defaults.baseURL}${channel.logo}` : null,
        path: `/live-tv/${channel._id}`,
        exclusive: false,
      })),
    [realChannels],
  );

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (settingsLoading) {
    return <CircleRowSkeleton />;
  }

  if (displayedChannels.length === 0) {
    return (
      <section className="w-full overflow-hidden bg-[#111618] py-5 text-white sm:py-7 lg:py-8">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
          <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.5px] text-white sm:text-[26px] lg:text-[30px]">
            {sectionTitle}
          </h2>
          <EmptySection />
        </div>
      </section>
    );
  }

  const updateNavigation = (swiper) => {
    if (!swiper) return;

    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handlePrevious = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <section className="group/live-tv w-full overflow-hidden bg-[#111618] py-5 text-white sm:py-7 lg:py-8">
      {/* Fixed-width container */}
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
        {/* Section title */}
        <h2 className="text-[22px] font-semibold tracking-[-0.5px] text-white sm:text-[26px] lg:text-[30px]">
          {sectionTitle}
        </h2>

        {/* Live TV slider */}
        <div className="live-tv-slider-boundary relative mt-4 sm:mt-5">
          <Swiper
            modules={[Keyboard, A11y]}
            slidesPerView="auto"
            slidesPerGroup={1}
            spaceBetween={14}
            grabCursor
            watchOverflow
            keyboard={{
              enabled: true,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              updateNavigation(swiper);
            }}
            onSlideChange={updateNavigation}
            onResize={updateNavigation}
            onBreakpoint={updateNavigation}
            breakpoints={{
              390: {
                slidesPerView: "auto",
                spaceBetween: 16,
              },
              640: {
                slidesPerView: "auto",
                spaceBetween: 20,
              },
              768: {
                slidesPerView: "auto",
                spaceBetween: 24,
              },

              /*
               * Desktop/laptop-এ reference image-এর মতো
               * ঠিক ৮টি সম্পূর্ণ channel দেখা যাবে।
               */
              1024: {
                slidesPerView: 8,
                slidesPerGroup: 1,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 8,
                slidesPerGroup: 1,
                spaceBetween: 24,
              },
              1536: {
                slidesPerView: 8,
                slidesPerGroup: 1,
                spaceBetween: 26,
              },
            }}
            className="live-tv-swiper"
          >
            {displayedChannels.map((channel, index) => (
              <SwiperSlide key={channel.id} className="live-tv-slide">
                <NavLink
                  to={channel.path}
                  aria-label={`Watch ${channel.name} live`}
                  className="relative block w-full cursor-pointer"
                >
                  {/* Circular channel card */}
                  <div className="relative aspect-square w-full rounded-full bg-white p-[5px] shadow-[0_8px_22px_rgba(0,0,0,0.2)]">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                      {channel.image ? (
                        <img
                          src={channel.image}
                          alt={channel.name}
                          draggable={false}
                          loading={index < 8 ? "eager" : "lazy"}
                          className="h-full w-full select-none rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-black text-[#111618]">
                          {channel.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>

                    {/* Exclusive badge */}
                    {channel.exclusive && (
                      <span className="absolute left-1/2 top-[-10px] z-10 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#59e8ee] px-2 py-[5px] text-[8px] font-semibold leading-none text-[#063238] sm:top-[-11px] sm:text-[9px] lg:top-[-12px] lg:px-[10px] lg:text-[11px]">
                        Exclusive
                      </span>
                    )}
                  </div>

                  {/* Channel name */}
                  <h3
                    title={channel.name}
                    className="mt-2 truncate px-1 text-center text-[10px] font-semibold text-[#c9cdcf] sm:text-[11px] lg:mt-[9px] lg:text-[13px]"
                  >
                    {channel.name}
                  </h3>
                </NavLink>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Previous button—hover করলে দেখা যাবে */}
          {!isBeginning && (
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous live TV channels"
              className="invisible absolute left-1 top-[43%] z-50 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#252c2e]/95 text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/live-tv:visible group-hover/live-tv:opacity-100 hover:scale-105 hover:bg-[#343c3e] active:scale-95 lg:flex"
            >
              <ChevronLeft size={25} strokeWidth={1.8} />
            </button>
          )}

          {/* Next button—hover করলে দেখা যাবে */}
          {!isEnd && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next live TV channels"
              className="invisible absolute right-1 top-[43%] z-50 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#252c2e]/95 text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/live-tv:visible group-hover/live-tv:opacity-100 hover:scale-105 hover:bg-[#343c3e] active:scale-95 lg:flex"
            >
              <ChevronRight size={25} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          /*
           * প্রথম ৮টির পরে অন্য channel-এর কোনো অংশ
           * container-এর বাইরে দেখা যাবে না।
           */
          .live-tv-slider-boundary {
            position: relative;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
          }

          .live-tv-swiper {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            padding-top: 13px;
            padding-bottom: 8px;
          }

          .live-tv-swiper .swiper-wrapper {
            align-items: flex-start;
          }

          /*
           * Mobile fixed-size channels
           */
          .live-tv-slide {
            width: 112px;
          }

          @media (min-width: 390px) {
            .live-tv-slide {
              width: 120px;
            }
          }

          @media (min-width: 480px) {
            .live-tv-slide {
              width: 135px;
            }
          }

          @media (min-width: 640px) {
            .live-tv-slide {
              width: 150px;
            }
          }

          @media (min-width: 768px) {
            .live-tv-slide {
              width: 165px;
            }
          }

          /*
           * Desktop width Swiper calculate করবে,
           * যাতে ঠিক ৮টি সম্পূর্ণ channel দেখা যায়।
           */
          @media (min-width: 1024px) {
            .live-tv-slide {
              width: auto;
            }
          }
        `}
      </style>
    </section>
  );
};

export default LiveTv;
