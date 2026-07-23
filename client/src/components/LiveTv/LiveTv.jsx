import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const liveTvChannels = [
  {
    id: 1,
    name: "Deepto TV",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/05/05/thumbnails_53d5a9f2d17d89002d2154f39251d374_goplay_deppto_land.png?w=320&q=75",
    path: "/live-tv/deepto-tv",
    exclusive: true,
  },
  {
    id: 2,
    name: "Al Jazeera",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/08/04/thumbnails_ae0d22fd52cb94c62c870f10591fbab8_goplay_al_jazeera_logo.jpg?w=320&q=75",
    path: "/live-tv/al-jazeera",
    exclusive: true,
  },
  {
    id: 3,
    name: "DW",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/22/thumbnails_e5bcce2b56ccc7a17ca497bb76b3b99b_goplay_dw_landscape.jpg?w=320&q=75",
    path: "/live-tv/dw",
    exclusive: true,
  },
  {
    id: 4,
    name: "SRK TV",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/08/11/thumbnails_58ebcef1efcc65837557de15952d2643_goplay_srk_tv_landscape.jpg?w=320&q=75",
    path: "/live-tv/srk-tv",
    exclusive: true,
  },
  {
    id: 5,
    name: "CNBC",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/22/thumbnails_e056ee2fae844cd280039875a78673b3_goplay_cnbc.jpg?w=320&q=75",
    path: "/live-tv/cnbc",
    exclusive: true,
  },
  {
    id: 6,
    name: "NDTV",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/08/04/thumbnails_117c10db52e38d713603c89b68958401_goplay_nd_tv_logo.jpg?w=320&q=75",
    path: "/live-tv/ndtv",
    exclusive: true,
  },
  {
    id: 7,
    name: "Akash Aath",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/22/thumbnails_bf221f76c330935c1da018c4d98232ea_goplay_akaash_atth_landscape.jpg?w=320&q=75",
    path: "/live-tv/akash-aath",
    exclusive: true,
  },
  {
    id: 8,
    name: "Dangal TV",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/22/thumbnails_f1120ea0678783ed60ac2a31e01787f9_goplay_dangal_tv_landscape.jpg?w=320&q=75",
    path: "/live-tv/dangal-tv",
    exclusive: true,
  },
  {
    id: 9,
    name: "Hum Sitaray",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/22/thumbnails_24221f32c423648fde64f213029e492c_goplay_hum_sitare_landscape.jpg?w=320&q=75",
    path: "/live-tv/hum-sitaray",
    exclusive: true,
  },
  {
    id: 10,
    name: "Express Entertainment",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/22/thumbnails_f3fdd8012da9d6b1bd9cd3f3f895333b_goplay_express_entertainment.jpg?w=320&q=75",
    path: "/live-tv/express-entertainment",
    exclusive: true,
  },
  {
    id: 11,
    name: "Rongeen TV",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/22/thumbnails_40a39ce477239a3581186abb1ca0a157_goplay_rongeen_tv_landscape.jpg?w=320&q=75",
    path: "/live-tv/rongeen-tv",
    exclusive: true,
  },
  {
    id: 12,
    name: "Channel i",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/02/18/thumbnails_560c067a16528300e31b78cccf25cba5_goplay_channel_i_logo_landscape.jpg?w=320&q=75",
    path: "/live-tv/channel-i",
    exclusive: true,
  },
];

const LiveTv = () => {
  const swiperRef = useRef(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

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
          Live TV
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
            {liveTvChannels.map((channel, index) => (
              <SwiperSlide key={channel.id} className="live-tv-slide">
                <NavLink
                  to={channel.path}
                  aria-label={`Watch ${channel.name} live`}
                  className="relative block w-full cursor-pointer"
                >
                  {/* Circular channel card */}
                  <div className="relative aspect-square w-full rounded-full bg-white p-[5px] shadow-[0_8px_22px_rgba(0,0,0,0.2)]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-white">
                      <img
                        src={channel.image}
                        alt={channel.name}
                        draggable={false}
                        loading={index < 8 ? "eager" : "lazy"}
                        className="h-full w-full select-none rounded-full object-cover"
                      />
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
