import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, Share2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { A11y, FreeMode, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { alignHoverPreview } from "../../utils/alignHoverPreview";
import { api } from "../../api/axios";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import RowSkeleton from "../Skeletons/RowSkeleton";
import EmptySection from "../EmptySection/EmptySection";

import "swiper/css";
import "swiper/css/free-mode";

const Football = () => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  const { settings, loading: settingsLoading } = useSiteSettings();
  const section = settings?.homeSections?.football;
  const sectionTitle = section?.title || "FIFA Rewind";
  const desktopBackground = section?.backgroundDesktop
    ? `${api.defaults.baseURL}${section.backgroundDesktop}`
    : null;
  const mobileBackground = section?.backgroundMobile
    ? `${api.defaults.baseURL}${section.backgroundMobile}`
    : null;

  const promoted = settings?.promotedVideos?.football;
  const displayedItems = (promoted || []).map((video) => ({
    id: video.id,
    title: video.title,
    shortTitle: video.title,
    round: video.channelName,
    category: video.category,
    description: video.description || video.channelName,
    image: `${api.defaults.baseURL}${video.thumbnail?.portrait}`,
    hoverImage: `${api.defaults.baseURL}${video.thumbnail?.landscape}`,
    path: `/watch/${video.id}`,
    isReal: true,
  }));

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (settingsLoading) {
    return <RowSkeleton cardWidth={180} cardHeight={280} />;
  }

  if (displayedItems.length === 0) {
    return (
      <section className="w-full overflow-hidden bg-[#111618] py-4 text-white sm:py-7 lg:py-9">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
          <h2 className="mb-4 text-[19px] font-semibold tracking-[-0.4px] text-white sm:text-[25px] lg:text-[30px]">
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

  const handlePlay = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    navigate(item.path);
  };

  const handleAddToList = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Add to list:", item.id);
  };

  const handleShare = async (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    const shareUrl = `${window.location.origin}${item.path}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: shareUrl,
        });
      } catch {
        // User cancelled sharing
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      console.log("Share:", shareUrl);
    }
  };

  return (
    <section className="w-full overflow-x-clip overflow-y-visible bg-[#111618] py-4 text-white sm:py-7 lg:py-9">
      {/* Background container */}
      <div
        className="football-background group/football relative mx-auto w-full max-w-[1920px] overflow-x-clip overflow-y-visible rounded-[14px] bg-[#111618] bg-center bg-no-repeat sm:rounded-[25px] lg:min-h-[625px] lg:rounded-[52px]"
        style={{
          "--football-mobile-bg": mobileBackground ? `url("${mobileBackground}")` : "none",
          "--football-desktop-bg": desktopBackground ? `url("${desktopBackground}")` : "none",
        }}
      >
        {/* Mobile readability overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black/5 lg:bg-transparent" />

        {/* Fixed-width content */}
        <div className="relative z-10 mx-auto flex min-h-[375px] w-full max-w-[1680px] flex-col justify-end px-4 pb-3 pt-[70px] sm:min-h-[480px] sm:px-6 sm:pb-6 sm:pt-[160px] lg:min-h-[625px] lg:px-10 lg:pb-8 lg:pt-[260px] xl:px-[42px]">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5">
            <h2 className="text-[19px] font-semibold tracking-[-0.4px] text-white sm:text-[25px] lg:text-[30px]">
              {sectionTitle}
            </h2>

            {/* Mobile: visible; desktop: section hover করলে visible */}
            <NavLink
              to="/creator-channels"
              className="flex h-[30px] cursor-pointer items-center gap-1 rounded-[7px] bg-[#192532] px-3 text-[10px] font-semibold text-white transition-all duration-300 hover:bg-[#273748] sm:h-[34px] sm:text-[12px] lg:invisible lg:h-[36px] lg:px-4 lg:text-[13px] lg:opacity-0 lg:group-hover/football:visible lg:group-hover/football:opacity-100"
            >
              <span>See All</span>
              <span aria-hidden="true">→</span>
            </NavLink>
          </div>

          {/* Slider */}
          <div className="football-slider-boundary relative">
            <Swiper
              modules={[Keyboard, A11y, FreeMode]}
              slidesPerView="auto"
              slidesPerGroup={1}
              spaceBetween={8}
              speed={450}
              grabCursor
              watchOverflow
              resistance
              resistanceRatio={0.65}
              touchRatio={1.15}
              threshold={3}
              longSwipes
              longSwipesRatio={0.25}
              shortSwipes
              followFinger
              allowTouchMove
              freeMode={{
                enabled: true,
                momentum: true,
                momentumRatio: 0.75,
                momentumVelocityRatio: 0.85,
                momentumBounce: false,
                minimumVelocity: 0.02,
                sticky: false,
              }}
              keyboard={{
                enabled: true,
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                updateNavigation(swiper);
              }}
              onSlideChange={updateNavigation}
              onReachBeginning={updateNavigation}
              onReachEnd={updateNavigation}
              onFromEdge={updateNavigation}
              onResize={updateNavigation}
              onBreakpoint={updateNavigation}
              breakpoints={{
                390: {
                  slidesPerView: "auto",
                  slidesPerGroup: 1,
                  spaceBetween: 8,
                  freeMode: {
                    enabled: true,
                    momentum: true,
                    momentumRatio: 0.75,
                    momentumVelocityRatio: 0.85,
                    momentumBounce: false,
                    sticky: false,
                  },
                },
                640: {
                  slidesPerView: "auto",
                  slidesPerGroup: 1,
                  spaceBetween: 12,
                  freeMode: {
                    enabled: true,
                    momentum: true,
                    momentumBounce: false,
                    sticky: false,
                  },
                },
                768: {
                  slidesPerView: "auto",
                  slidesPerGroup: 1,
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: 7,
                  slidesPerGroup: 1,
                  spaceBetween: 18,
                  freeMode: {
                    enabled: false,
                  },
                },
                1280: {
                  slidesPerView: 7,
                  slidesPerGroup: 1,
                  spaceBetween: 20,
                  freeMode: {
                    enabled: false,
                  },
                },
                1536: {
                  slidesPerView: 7,
                  slidesPerGroup: 1,
                  spaceBetween: 22,
                  freeMode: {
                    enabled: false,
                  },
                },
              }}
              className="football-swiper"
            >
              {displayedItems.map((item, index) => (
                <SwiperSlide key={item.id} className="football-card-slide">
                  <div
                    className="group/card relative w-full cursor-pointer"
                    onMouseEnter={(event) =>
                      alignHoverPreview(
                        event,
                        ".football-slider-boundary",
                        ".football-hover-preview",
                        385,
                      )
                    }
                  >
                    {/* Normal portrait card */}
                    <NavLink
                      to={item.path}
                      aria-label={`Watch ${item.title}`}
                      className="block w-full cursor-pointer"
                    >
                      <article className="w-full">
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[7px] border border-white/15 bg-[#151b1d] shadow-[0_8px_20px_rgba(0,0,0,0.22)] sm:rounded-[9px]">
                          <img
                            src={item.image}
                            alt={item.title}
                            draggable={false}
                            loading={index < 3 ? "eager" : "lazy"}
                            decoding="async"
                            fetchPriority={index < 3 ? "high" : "auto"}
                            className="h-full w-full select-none object-cover"
                          />

                          {!item.isReal && (
                            <span className="absolute right-1.5 top-1.5 z-10 rounded-[3px] bg-[#5ce8ef] px-1.5 py-[4px] text-[7px] font-semibold leading-none text-[#063238] sm:right-2 sm:top-2 sm:px-2 sm:text-[9px] lg:text-[10px]">
                              Replay
                            </span>
                          )}
                        </div>

                        <h3
                          title={item.title}
                          className="mt-[6px] truncate px-0.5 text-center text-[9px] font-semibold text-white sm:text-[11px] lg:text-[12px]"
                        >
                          {item.isReal ? item.title : `${item.shortTitle} | FIFA World Cup`}
                        </h3>
                      </article>
                    </NavLink>

                    {/* Desktop hover preview */}
                    <div className="football-hover-preview pointer-events-none absolute bottom-[-4px] left-1/2 z-[9999] hidden w-[385px] -translate-x-1/2 translate-y-3 overflow-hidden rounded-[11px] border border-white/15 bg-[#182022] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.75)] transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:block">
                      <NavLink
                        to={item.path}
                        className="relative block h-[216px] w-full cursor-pointer overflow-hidden bg-[#101517]"
                      >
                        <img
                          src={item.hoverImage}
                          alt={item.title}
                          draggable={false}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full select-none object-cover transition-transform duration-500 hover:scale-[1.03]"
                        />

                        {!item.isReal && (
                          <span className="absolute right-3 top-3 rounded-[4px] bg-[#5ce8ef] px-2.5 py-[5px] text-[10px] font-semibold text-[#063238]">
                            Replay
                          </span>
                        )}
                      </NavLink>

                      <div className="px-5 pb-5 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(event) => handlePlay(event, item)}
                              aria-label={`Play ${item.title}`}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-black transition-all duration-200 hover:scale-105 hover:bg-[#16d6dc] active:scale-95"
                            >
                              <Play
                                size={19}
                                fill="currentColor"
                                strokeWidth={1.8}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => handleAddToList(event, item)}
                              aria-label="Add to my list"
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#303638] text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black active:scale-95"
                            >
                              <Plus size={21} strokeWidth={1.7} />
                            </button>

                            <button
                              type="button"
                              onClick={(event) => handleShare(event, item)}
                              aria-label={`Share ${item.title}`}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#303638] text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black active:scale-95"
                            >
                              <Share2 size={18} strokeWidth={1.7} />
                            </button>
                          </div>

                          <span className="rounded-full bg-[#2b3032] px-3 py-[5px] text-[11px] font-semibold text-white">
                            {item.category}
                          </span>
                        </div>

                        <NavLink
                          to={item.path}
                          className="mt-4 block cursor-pointer"
                        >
                          <h3 className="truncate text-[19px] font-semibold uppercase leading-tight text-white transition-colors hover:text-[#16d6dc]">
                            {item.title}
                          </h3>
                        </NavLink>

                        <p className="mt-1 text-[11px] font-semibold text-[#5ce8ef]">
                          {item.round}
                        </p>

                        <p className="mt-2 truncate text-[13px] font-medium text-[#9fa6a8]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Desktop previous button */}
            {!isBeginning && (
              <button
                type="button"
                onClick={handlePrevious}
                aria-label="Previous football matches"
                className="invisible absolute left-1 top-[45%] z-[10000] hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/football:visible group-hover/football:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
              >
                <ChevronLeft size={28} strokeWidth={1.7} />
              </button>
            )}

            {/* Desktop next button */}
            {!isEnd && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next football matches"
                className="invisible absolute right-0 top-[45%] z-[10000] hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/football:visible group-hover/football:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
              >
                <ChevronRight size={28} strokeWidth={1.7} />
              </button>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
    /*
     * Mobile background
     */
    .football-background {
      background-image: var(--football-mobile-bg);
      background-size: cover;
      background-position: center top;
      background-repeat: no-repeat;
    }

    .football-slider-boundary {
      position: relative;
      z-index: 20;
      width: 100%;
      max-width: 100%;
      overflow-x: clip;
      overflow-y: visible;
    }

    .football-swiper {
      position: relative;
      z-index: 20;
      width: 100%;
      max-width: 100%;
      overflow: visible;
      padding-top: 5px;
      padding-bottom: 12px;
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
    }

    .football-swiper .swiper-wrapper {
      align-items: flex-start;
      overflow: visible;
      will-change: transform;
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
    }

    .football-card-slide {
      position: relative;
      z-index: 1;
      width: 130px;
      overflow: visible;
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
    }

    .football-card-slide img {
      backface-visibility: hidden;
    }

    .football-card-slide:hover {
      z-index: 9999 !important;
    }

    @media (min-width: 390px) {
      .football-card-slide {
        width: 138px;
      }
    }

    @media (min-width: 480px) {
      .football-card-slide {
        width: 150px;
      }
    }

    @media (min-width: 640px) {
      .football-card-slide {
        width: 170px;
      }

      .football-swiper {
        padding-top: 8px;
        padding-bottom: 18px;
      }
    }

    @media (min-width: 768px) {
      .football-card-slide {
        width: 190px;
      }
    }

    /*
     * Desktop background
     */
    @media (min-width: 1024px) {
      .football-background {
        background-image: var(--football-desktop-bg);
        background-size: cover;
        background-position: center;
      }

      .football-card-slide {
        width: auto;
      }

      .football-swiper {
        padding-top: 10px;
        padding-bottom: 26px;
        touch-action: auto;
      }

      .football-card-slide:hover {
        z-index: 9999 !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .football-card-slide * {
        transition-duration: 100ms !important;
        animation-duration: 100ms !important;
      }
    }
  `}
      </style>
    </section>
  );
};

export default Football;
