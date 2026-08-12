import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Play, Plus, VolumeX } from "lucide-react";
import { useNavigate } from "react-router";
import { Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { api } from "../../api/axios";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import BannerSkeleton from "../Skeletons/BannerSkeleton";
import EmptySection from "../EmptySection/EmptySection";

import "swiper/css";

const Slider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const { settings, loading } = useSiteSettings();

  if (loading) {
    return <BannerSkeleton />;
  }

  const promoted = settings?.promotedVideos?.slider;
  const displayedItems = (promoted || []).map((video) => ({
    id: video.id,
    title: video.title,
    desktopImage: `${api.defaults.baseURL}${video.thumbnail?.landscape}`,
    mobileImage: `${api.defaults.baseURL}${video.thumbnail?.portrait}`,
    duration: video.duration,
    year: "",
    rating: video.maturityRating,
    exclusive: false,
    path: `/watch/${video.id}`,
  }));

  if (displayedItems.length === 0) {
    return (
      <section className="w-full bg-[#111618] px-4 py-[10px] sm:px-6 lg:px-10 lg:py-[11px]">
        <EmptySection message="No slider content added yet. Please add it from the admin panel." />
      </section>
    );
  }

  const handlePlay = (item) => {
    navigate(item.path);
  };

  const handleAddToList = (item) => {
    console.log("Add to list:", item.id);
  };

  const handleDetails = (item) => {
    navigate(item.path);
  };

  const handleMute = (item) => {
    console.log("Mute/unmute:", item.id);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#111618] py-[10px] lg:py-[11px]">
      <Swiper
        modules={[Autoplay, Keyboard]}
        centeredSlides
        loop
        grabCursor
        watchSlidesProgress
        slidesPerView="auto"
        spaceBetween={8}
        speed={900}
        keyboard={{
          enabled: true,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        onRealIndexChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        breakpoints={{
          640: {
            spaceBetween: 10,
          },
          768: {
            spaceBetween: 12,
          },
          1024: {
            spaceBetween: 14,
          },
        }}
        className="bioscope-slider w-full"
      >
        {displayedItems.map((item, index) => (
          <SwiperSlide
            key={item.id}
            className="bioscope-slide cursor-grab overflow-hidden rounded-[13px] active:cursor-grabbing lg:rounded-[17px]"
          >
            {({ isActive }) => (
              <article
                onClick={() => {
                  if (isActive) {
                    handleDetails(item);
                  }
                }}
                className={`relative h-full w-full overflow-hidden rounded-[inherit] border ${
                  isActive
                    ? "cursor-pointer border-white/20"
                    : "border-white/10"
                }`}
              >
                {/* Mobile portrait image */}
                <img
                  src={item.mobileImage}
                  alt={item.title}
                  draggable={false}
                  loading={index < 2 ? "eager" : "lazy"}
                  className="block h-full w-full select-none object-cover lg:hidden"
                />

                {/* Desktop landscape image */}
                <img
                  src={item.desktopImage}
                  alt={item.title}
                  draggable={false}
                  loading={index < 2 ? "eager" : "lazy"}
                  className="hidden h-full w-full select-none object-cover lg:block"
                />

                {/* Exclusive badge */}
                {item.exclusive && (
                  <span className="absolute right-2 top-2 z-20 rounded-[4px] bg-[#5eeaf2] px-2 py-1 text-[8px] font-semibold text-[#062e34] sm:right-3 sm:top-3 sm:text-[9px] lg:right-4 lg:top-4 lg:text-[11px]">
                    Exclusive
                  </span>
                )}

                {/* Only active slide information */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key={`${item.id}-${activeIndex}`}
                      initial={{
                        opacity: 0,
                        y: 22,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 14,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: 0.1,
                      }}
                      className="absolute inset-x-0 bottom-0 z-10"
                    >
                      {/* Active slide bottom gradient */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/95 via-black/35 to-transparent lg:h-[65%] lg:from-black/90 lg:via-black/45" />

                      <div className="relative z-10 px-3 pb-[13px] sm:px-6 sm:pb-6 lg:px-10 lg:pb-10">
                        {/* Title */}
                        <h2 className="mx-auto max-w-[94%] text-center text-[27px] font-bold uppercase leading-[0.98] tracking-[-0.6px] text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] sm:text-[34px] lg:mx-0 lg:max-w-[72%] lg:text-left lg:text-[46px] lg:font-semibold lg:normal-case lg:leading-[1.05] xl:text-[50px]">
                          {item.title}
                        </h2>

                        <div className="mt-4 flex items-end justify-center lg:justify-between">
                          {/* Buttons */}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handlePlay(item);
                              }}
                              className="flex h-[42px] min-w-[142px] cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-black transition-all duration-200 hover:scale-[1.03] hover:bg-[#16d6dc] active:scale-95 sm:h-[44px] sm:min-w-[160px] lg:h-[48px] lg:min-w-[190px] lg:px-7 lg:text-[17px]"
                            >
                              <Play
                                size={17}
                                fill="currentColor"
                                strokeWidth={1.8}
                              />

                              <span>Play Now</span>
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleAddToList(item);
                              }}
                              aria-label="Add to my list"
                              className="hidden h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full border border-white/70 bg-black/15 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:text-black active:scale-95 lg:flex"
                            >
                              <Plus size={24} strokeWidth={1.5} />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDetails(item);
                              }}
                              aria-label="View details"
                              className="hidden h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full border border-white/70 bg-black/15 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:text-black active:scale-95 lg:flex"
                            >
                              <Info size={21} strokeWidth={1.7} />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleMute(item);
                              }}
                              aria-label="Mute or unmute"
                              className="hidden h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full border border-white/70 bg-black/15 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:text-black active:scale-95 lg:flex"
                            >
                              <VolumeX size={21} strokeWidth={1.7} />
                            </button>
                          </div>

                          {/* Desktop metadata */}
                          <div className="mb-1 hidden shrink-0 items-center gap-4 text-[16px] font-semibold text-white lg:flex">
                            <span>{item.duration}</span>

                            <span>{item.year}</span>

                            <span className="rounded-[4px] border border-white/50 bg-black/20 px-[8px] py-[2px] backdrop-blur-sm">
                              {item.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <style>
        {`
          .bioscope-slider {
            overflow: visible;
          }

          .bioscope-slider .swiper-wrapper {
            align-items: center;
          }

          /*
           * Mobile:
           * Middle slide = 80%
           * Left and right visible area = approximately 10% each
           */
          .bioscope-slider .bioscope-slide {
            width: 80%;
            height: min(119vw, 500px);
            opacity: 1;
            filter: none;
            transform: scale(0.965);
            transition:
              transform 900ms cubic-bezier(0.22, 1, 0.36, 1),
              opacity 700ms ease;
          }

          .bioscope-slider .bioscope-slide.swiper-slide-active {
            z-index: 5;
            opacity: 1;
            filter: none;
            transform: scale(1);
          }

          /*
           * No black overlay or reduced brightness
           * for left and right slides
           */
          .bioscope-slider .swiper-slide-prev,
          .bioscope-slider .swiper-slide-next {
            opacity: 1;
            filter: none;
          }

          @media (min-width: 640px) {
            .bioscope-slider .bioscope-slide {
              width: 76%;
              height: clamp(400px, 80vw, 570px);
            }
          }

          @media (min-width: 768px) {
            .bioscope-slider .bioscope-slide {
              width: 70%;
              height: clamp(450px, 70vw, 610px);
            }
          }

          /*
           * Desktop/laptop landscape slider
           */
          @media (min-width: 1024px) {
            .bioscope-slider .bioscope-slide {
              width: 60%;
              height: clamp(500px, 33.5vw, 645px);
              transform: scale(0.95);
            }

            .bioscope-slider .bioscope-slide.swiper-slide-active {
              transform: scale(1);
            }
          }

          @media (min-width: 1536px) {
            .bioscope-slider .bioscope-slide {
              width: 59.7%;
              max-width: 1146px;
              height: 645px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .bioscope-slider .bioscope-slide {
              transition-duration: 200ms;
            }
          }
        `}
      </style>
    </section>
  );
};

export default Slider;
