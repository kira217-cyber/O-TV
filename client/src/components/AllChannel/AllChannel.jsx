import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const channels = [
  {
    id: 1,
    name: "Chorki",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/29/posters_bc41826f91f3d339c461f6f8f402647a_goplay_chorki.png",
    path: "/channel/chorki",
    exclusive: true,
  },
  {
    id: 2,
    name: "SonyLiv",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/29/posters_bc5c7e6d1b48fbc2199ba3974e64579b_goplay_sonyliv.png",
    path: "/channel/sonyliv",
    exclusive: true,
  },
  {
    id: 3,
    name: "Lionsgate Play",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/29/posters_0a16a10446068211cd28bc00e1b89091_goplay_lgp.png",
    path: "/channel/lionsgate-play",
    exclusive: true,
  },
  {
    id: 4,
    name: "Hoichoi",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/10/13/images_83382f6f8877fdde9e2fc1bb334c101a_goplay_hoichoi_full_log_protrait_1.png",
    path: "/channel/hoichoi",
    exclusive: true,
  },
  {
    id: 5,
    name: "iScreen",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/29/posters_00e3cca08fd16dd4befed1291273d784_goplay_iscreen.png",
    path: "/channel/iscreen",
    exclusive: true,
  },
  {
    id: 6,
    name: "Deepto Play",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/29/posters_8a90c293da3963b7943de8052b6b49b9_goplay_deeptp.png",
    path: "/channel/deepto-play",
    exclusive: true,
  },
  {
    id: 7,
    name: "EpicOn",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/29/posters_49f597b8762d6b3ec19335b4ae07b7aa_goplay_epicon.png",
    path: "/channel/epicon",
    exclusive: true,
  },
  {
    id: 8,
    name: "ShemarooMe",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/29/posters_6d6a562194ff3a1836d92be180d27e70_goplay_shemaroome.png",
    path: "/channel/shemaroome",
    exclusive: true,
  },
  {
    id: 9,
    name: "Docubay",
    image:
      "https://asset.bioscopelive.com/uploads/images/2025/07/29/posters_302549f0add82c9b5d14fe94deff2e21_goplay_docubay.png",
    path: "/channel/docubay",
    exclusive: true,
  },
];

const AllChannel = () => {
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
    <section className="group/channels w-full overflow-hidden bg-[#111618] py-5 text-white sm:py-7 lg:py-8">
      {/* Fixed-width container */}
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
        {/* Section title */}
        <h2 className="text-[22px] font-semibold tracking-[-0.5px] text-white sm:text-[26px] lg:text-[30px]">
          Unlimited Entertainment
        </h2>

        {/* Channel slider */}
        <div className="all-channel-slider-boundary relative mt-4 sm:mt-5">
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
               * Desktop/laptop-এ ঠিক ৭টি সম্পূর্ণ channel।
               */
              1024: {
                slidesPerView: 7,
                slidesPerGroup: 1,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 7,
                slidesPerGroup: 1,
                spaceBetween: 28,
              },
              1536: {
                slidesPerView: 7,
                slidesPerGroup: 1,
                spaceBetween: 30,
              },
            }}
            className="all-channel-swiper"
          >
            {channels.map((channel, index) => (
              <SwiperSlide key={channel.id} className="all-channel-slide">
                <NavLink
                  to={channel.path}
                  aria-label={`Browse ${channel.name}`}
                  className="relative block w-full cursor-pointer"
                >
                  {/* Circular channel card */}
                  <div className="relative aspect-square w-full rounded-full border-2 border-[#393f41] bg-[#252a2c] p-[5px] shadow-[0_8px_22px_rgba(0,0,0,0.2)]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-[#181d1f]">
                      <img
                        src={channel.image}
                        alt={channel.name}
                        draggable={false}
                        loading={index < 7 ? "eager" : "lazy"}
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

                  <span className="sr-only">{channel.name}</span>
                </NavLink>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Previous button—section hover করলে দেখা যাবে */}
          {!isBeginning && (
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous channels"
              className="invisible absolute left-1 top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#252c2e]/95 text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/channels:visible group-hover/channels:opacity-100 hover:scale-105 hover:bg-[#343c3e] active:scale-95 lg:flex"
            >
              <ChevronLeft size={25} strokeWidth={1.8} />
            </button>
          )}

          {/* Next button—section hover করলে দেখা যাবে */}
          {!isEnd && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next channels"
              className="invisible absolute right-1 top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#252c2e]/95 text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/channels:visible group-hover/channels:opacity-100 hover:scale-105 hover:bg-[#343c3e] active:scale-95 lg:flex"
            >
              <ChevronRight size={25} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          /*
           * Boundary-এর বাইরে ৮ ও ৯ নম্বর channel-এর
           * কোনো অংশ দেখা যাবে না।
           */
          .all-channel-slider-boundary {
            position: relative;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
          }

          .all-channel-swiper {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            padding-top: 13px;
            padding-bottom: 8px;
          }

          .all-channel-swiper .swiper-wrapper {
            align-items: center;
          }

          /*
           * Mobile: fixed-size cards এবং horizontal swipe।
           */
          .all-channel-slide {
            width: 112px;
          }

          @media (min-width: 390px) {
            .all-channel-slide {
              width: 120px;
            }
          }

          @media (min-width: 480px) {
            .all-channel-slide {
              width: 135px;
            }
          }

          @media (min-width: 640px) {
            .all-channel-slide {
              width: 150px;
            }
          }

          @media (min-width: 768px) {
            .all-channel-slide {
              width: 165px;
            }
          }

          /*
           * Desktop-এ width Swiper calculate করবে,
           * যাতে ঠিক ৭টি সম্পূর্ণ card দেখা যায়।
           */
          @media (min-width: 1024px) {
            .all-channel-slide {
              width: auto;
            }
          }
        `}
      </style>
    </section>
  );
};

export default AllChannel;
