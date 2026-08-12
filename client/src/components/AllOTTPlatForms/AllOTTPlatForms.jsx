import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Share2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { alignHoverPreview } from "../../utils/alignHoverPreview";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { api } from "../../api/axios";
import RowSkeleton from "../Skeletons/RowSkeleton";
import EmptySection from "../EmptySection/EmptySection";

import "swiper/css";

const AllOTTPlatForms = () => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  const { settings, loading: settingsLoading } = useSiteSettings();
  const sectionTitle = settings?.homeSections?.allOtt?.title || "All OTT Platforms";

  const platformList = useMemo(
    () =>
      (settings?.channels || [])
        .filter((channel) => channel.logo)
        .map((channel) => ({
          id: channel.id,
          name: channel.name,
          logo: `${api.defaults.baseURL}${channel.logo}`,
        })),
    [settings],
  );

  const [selectedPlatformId, setSelectedPlatformId] = useState(null);
  const [channelVideos, setChannelVideos] = useState({});
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const activePlatform =
    selectedPlatformId &&
    platformList.some((platform) => platform.id === selectedPlatformId)
      ? selectedPlatformId
      : platformList[0]?.id;

  useEffect(() => {
    if (!activePlatform) return;
    if (channelVideos[activePlatform]) return;

    let cancelled = false;

    api
      .get(`/api/site/channels/${activePlatform}`)
      .then(({ data }) => {
        if (cancelled) return;
        setChannelVideos((previous) => ({
          ...previous,
          [activePlatform]: data?.data?.videos || [],
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setChannelVideos((previous) => ({
            ...previous,
            [activePlatform]: [],
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activePlatform, channelVideos]);

  const selectedPlatform =
    platformList.find((platform) => platform.id === activePlatform) ||
    platformList[0];

  const displayedMovies = useMemo(() => {
    const videos = channelVideos[activePlatform] || [];

    return videos.map((video) => ({
      id: video._id,
      title: video.title,
      category: video.category,
      badge: "",
      description: selectedPlatform?.name || "",
      image: `${api.defaults.baseURL}${video.thumbnail?.landscape}`,
      hoverImage: `${api.defaults.baseURL}${video.thumbnail?.landscape}`,
      path: `/watch/${video._id}`,
      displayId: `real-${video._id}`,
    }));
  }, [activePlatform, channelVideos, selectedPlatform]);

  if (settingsLoading) {
    return <RowSkeleton cardWidth={280} cardHeight={158} />;
  }

  if (platformList.length === 0) {
    return (
      <section className="w-full overflow-hidden bg-[#111618] py-6 text-white sm:py-8 lg:py-9">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
          <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.4px] text-white sm:text-[26px] lg:text-[30px]">
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

  const handlePlay = (event, movie) => {
    event.preventDefault();
    event.stopPropagation();

    navigate(movie.path);
  };

  const handleAddToList = (event, movie) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Add to list:", movie.id);
  };

  const handleShare = async (event, movie) => {
    event.preventDefault();
    event.stopPropagation();

    const shareUrl = `${window.location.origin}${movie.path}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.description,
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
    <section className="group/ott relative z-10 w-full overflow-x-clip overflow-y-visible bg-[#111618] py-6 text-white sm:py-8 lg:py-9">
      {/* Fixed-width container */}
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
        {/* Title */}
        <h2 className="text-[22px] font-semibold tracking-[-0.4px] text-white sm:text-[26px] lg:text-[30px]">
          {sectionTitle}
        </h2>

        {/* OTT platform navigation */}
        <div className="ott-platform-scroll mt-4 flex items-center gap-2 overflow-x-auto pb-[11px] sm:mt-5 sm:gap-3 lg:gap-4">
          {platformList.map((platform) => {
            const isActive = activePlatform === platform.id;

            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setSelectedPlatformId(platform.id)}
                className={`relative flex h-[46px] shrink-0 cursor-pointer items-center gap-2 rounded-[9px] border px-3 transition-all duration-200 sm:h-[51px] sm:px-4 ${
                  isActive
                    ? "border-[#23e2e8] bg-[#1d2426] text-white"
                    : "border-transparent bg-transparent text-[#e1e4e5] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {/* Platform logo */}
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-[#202628] sm:h-[28px] sm:w-[28px]">
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                  />
                </span>

                <span className="whitespace-nowrap text-[13px] font-semibold sm:text-[15px] lg:text-[17px]">
                  {platform.name}
                </span>

                {/* Active triangle */}
                {isActive && (
                  <span className="absolute -bottom-[9px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#23e2e8]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Fixed-width slider boundary */}
        <div className="ott-slider-boundary relative z-20 mt-3 sm:mt-4">
          {displayedMovies.length === 0 ? (
            <EmptySection
              message={`No videos added yet for ${selectedPlatform?.name || "this channel"}. Please add it from the admin panel.`}
            />
          ) : (
          <>
          <Swiper
            key={activePlatform}
            modules={[Keyboard, A11y]}
            slidesPerView="auto"
            slidesPerGroup={1}
            spaceBetween={10}
            grabCursor
            keyboard={{
              enabled: true,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              updateNavigation(swiper);
            }}
            onSlideChange={updateNavigation}
            onResize={updateNavigation}
            breakpoints={{
              480: {
                spaceBetween: 12,
              },
              768: {
                spaceBetween: 16,
              },
              1024: {
                spaceBetween: 20,
              },
            }}
            className="ott-content-swiper"
          >
            {displayedMovies.map((movie, index) => (
              <SwiperSlide key={movie.displayId} className="ott-content-slide">
                <div
                  className="group/card relative w-full cursor-pointer"
                  onMouseEnter={(event) =>
                    alignHoverPreview(
                      event,
                      ".ott-slider-boundary",
                      ".ott-hover-preview",
                      385,
                    )
                  }
                >
                  {/* Normal movie card */}
                  <NavLink
                    to={movie.path}
                    aria-label={`Watch ${movie.title}`}
                    className="block w-full cursor-pointer"
                  >
                    <article className="w-full">
                      <div className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#182023]">
                        <img
                          src={movie.image}
                          alt={movie.title}
                          draggable={false}
                          loading={index < 4 ? "eager" : "lazy"}
                          className="h-full w-full select-none object-cover"
                        />

                        {/* Platform logo */}
                        <span className="absolute left-2 top-2 z-10 flex h-[27px] w-[27px] overflow-hidden rounded-[4px] bg-black/50 backdrop-blur-sm">
                          <img
                            src={selectedPlatform.logo}
                            alt={selectedPlatform.name}
                            draggable={false}
                            className="h-full w-full object-cover"
                          />
                        </span>

                        {/* Exclusive badge */}
                        {movie.badge === "Exclusive" && (
                          <span className="absolute right-2 top-2 z-10 rounded-[4px] bg-[#5ce8ef] px-2 py-[5px] text-[8px] font-semibold leading-none text-[#063238] sm:text-[9px] lg:text-[11px]">
                            Exclusive
                          </span>
                        )}

                        {/* New release badge */}
                        {movie.badge === "New Release" && (
                          <span className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-t-[4px] bg-[#4b63ed] px px-4 py-[5px] text-[8px] font-semibold leading-none text-white sm:text-[9px] lg:text-[11px]">
                            New Release
                          </span>
                        )}
                      </div>

                      {/* Mobile title */}
                      <h3 className="mt-[7px] truncate px-1 text-[11px] font-semibold text-[#c9cdcf] sm:text-[12px] lg:hidden">
                        {movie.title}
                      </h3>
                    </article>
                  </NavLink>

                  {/* ======================================
                      DESKTOP HOVER PREVIEW
                  ====================================== */}
                  <div className="ott-hover-preview pointer-events-none absolute bottom-[-4px] left-1/2 z-[9999] hidden w-[385px] -translate-x-1/2 translate-y-3 overflow-hidden rounded-[11px] border border-white/15 bg-[#182022] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.75)] transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:block">
                    {/* Hover landscape image */}
                    <NavLink
                      to={movie.path}
                      className="relative block h-[216px] w-full cursor-pointer overflow-hidden bg-[#101517]"
                    >
                      <img
                        src={movie.hoverImage}
                        alt={movie.title}
                        draggable={false}
                        className="h-full w-full select-none object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />

                      {/* Platform logo */}
                      <span className="absolute left-3 top-3 flex h-9 w-9 overflow-hidden rounded-[5px] bg-black/55 backdrop-blur-sm">
                        <img
                          src={selectedPlatform.logo}
                          alt={selectedPlatform.name}
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                      </span>

                      {movie.badge && (
                        <span
                          className={`absolute right-3 top-3 rounded-[4px] px-2.5 py-[5px] text-[10px] font-semibold ${
                            movie.badge === "New Release"
                              ? "bg-[#4b63ed] text-white"
                              : "bg-[#5ce8ef] text-[#063238]"
                          }`}
                        >
                          {movie.badge}
                        </span>
                      )}
                    </NavLink>

                    {/* Hover information */}
                    <div className="px-5 pb-5 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(event) => handlePlay(event, movie)}
                            aria-label={`Play ${movie.title}`}
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
                            onClick={(event) => handleAddToList(event, movie)}
                            aria-label={`Add ${movie.title} to list`}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#303638] text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black active:scale-95"
                          >
                            <Plus size={21} strokeWidth={1.7} />
                          </button>

                          <button
                            type="button"
                            onClick={(event) => handleShare(event, movie)}
                            aria-label={`Share ${movie.title}`}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#303638] text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black active:scale-95"
                          >
                            <Share2 size={18} strokeWidth={1.7} />
                          </button>
                        </div>

                        {/* Category */}
                        <span className="rounded-full bg-[#2b3032] px-3 py-[5px] text-[11px] font-semibold text-white">
                          {movie.category}
                        </span>
                      </div>

                      <NavLink
                        to={movie.path}
                        className="mt-4 block cursor-pointer"
                      >
                        <h3 className="truncate text-[19px] font-semibold uppercase leading-tight text-white transition-colors hover:text-[#16d6dc]">
                          {movie.title}
                        </h3>
                      </NavLink>

                      <p className="mt-2 truncate text-[13px] font-medium text-[#9fa6a8]">
                        {movie.description}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Previous arrow */}
          {!isBeginning && (
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous OTT movies"
              className="invisible absolute left-2 top-1/2 z-[10000] hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/ott:visible group-hover/ott:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronLeft size={28} strokeWidth={1.7} />
            </button>
          )}

          {/* Next arrow */}
          {!isEnd && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next OTT movies"
              className="invisible absolute right-0 top-1/2 z-[10000] hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/ott:visible group-hover/ott:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronRight size={28} strokeWidth={1.7} />
            </button>
          )}
          </>
          )}
        </div>

        {/* Browse platform button */}
        <div className="mt-2 sm:mt-3">
          <NavLink
            to={`/channel/${selectedPlatform.id}`}
            className="group/browse inline-flex h-[43px] cursor-pointer items-center gap-3 rounded-[9px] bg-[#242b2d] px-4 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-[#30383a] active:scale-[0.98] sm:h-[48px] sm:text-[16px]"
          >
            <span>Browse {selectedPlatform.name}</span>

            <ArrowRight
              size={19}
              strokeWidth={1.7}
              className="transition-transform duration-200 group-hover/browse:translate-x-1"
            />
          </NavLink>
        </div>
      </div>

      <style>
        {`
          .ott-platform-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
            -webkit-overflow-scrolling: touch;
          }

          .ott-platform-scroll::-webkit-scrollbar {
            display: none;
          }

          /*
           * Horizontal direction-এ fixed container-এর
           * বাইরে cards দেখাবে না।
           *
           * Vertical direction-এ hover preview দেখা যাবে।
           */
          .ott-slider-boundary {
            position: relative;
            z-index: 20;
            width: 100%;
            max-width: 100%;
            overflow-x: clip;
            overflow-y: visible;
          }

          .ott-content-swiper {
            position: relative;
            z-index: 20;
            width: 100%;
            max-width: 100%;
            overflow: visible;
            padding-top: 10px;
            padding-bottom: 18px;
          }

          .ott-content-swiper .swiper-wrapper {
            align-items: flex-start;
            overflow: visible;
          }

          .ott-content-slide {
            position: relative;
            z-index: 1;
            width: 245px;
            overflow: visible;
          }

          .ott-content-slide:hover {
            z-index: 9999 !important;
          }

          @media (min-width: 390px) {
            .ott-content-slide {
              width: 265px;
            }
          }

          @media (min-width: 480px) {
            .ott-content-slide {
              width: 280px;
            }
          }

          @media (min-width: 640px) {
            .ott-content-slide {
              width: 300px;
            }
          }

          @media (min-width: 768px) {
            .ott-content-slide {
              width: 315px;
            }
          }

          @media (min-width: 1024px) {
            .ott-content-swiper {
              padding-top: 14px;
              padding-bottom: 32px;
            }

            .ott-content-slide {
              width: 280px;
              overflow: visible;
            }

            .ott-content-slide:hover {
              z-index: 9999 !important;
            }
          }

          @media (min-width: 1280px) {
            .ott-content-slide {
              width: 300px;
            }
          }

          @media (min-width: 1536px) {
            .ott-content-slide {
              width: 316px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .ott-content-slide *,
            .ott-platform-scroll * {
              transition-duration: 100ms !important;
              animation-duration: 100ms !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default AllOTTPlatForms;
