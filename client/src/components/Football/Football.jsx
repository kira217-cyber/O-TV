import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, Share2 } from "lucide-react";
import { NavLink } from "react-router";
import { A11y, FreeMode, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";

const FOOTBALL_DESKTOP_BACKGROUND =
  "https://asset.bioscopelive.com/uploads/images/2026/07/21/thumbnail_backgrounds_1bc44929b7ec290e1187d9be8a6bf8af_goplay_upcoming_web.png?w=1920&q=75";

const FOOTBALL_MOBILE_BACKGROUND =
  "https://asset.bioscopelive.com/uploads/images/2026/07/21/poster_backgrounds_0e87771687f96ed877d7af0ecca769fc_goplay_fifa_phone.png?w=1920&q=75";

/*
 * Normal card-এর portrait images।
 * ৪টি image পুনরায় ব্যবহার করে ১৪টি card হবে।
 */
const cardImages = [
  "https://asset.bioscopelive.com/uploads/images/2026/07/07/posters_f25c7cbbab0a92eb5c47b307cf0bbea2_goplay_por_vs_esp_16_p.png?w=640&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/08/posters_f66e4ffccd366054fad3b6c222b3c41e_goplay_arg_vs_egy_16_p.png?w=640&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/10/posters_2e938f393f9777722deab3afd201d9bb_goplay_fra_vs_mar_qrt_p.png?w=640&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/07/posters_4dda1d8fe6eec41f01ed6f2536498554_goplay_bra_vs_nor_replay_p.png?w=640&q=75",
];

/*
 * Desktop hover preview-এর landscape images।
 */
const hoverImages = [
  "https://asset.bioscopelive.com/uploads/images/2026/07/22/thumbnails_cfb121ea1074ee7d98649ef558656463_goplay_esp_vs_arg_l.png?w=480&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/16/thumbnails_60579b46cad485959f72d15d5ef451a0_goplay_arg_vs_egy_l.png?w=480&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/07/thumbnails_ff1cd0e6bbd5f2f944f8698989f865b4_goplay_bra_vs_nor_replay_l.png?w=480&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/19/thumbnails_85eebc56d68da5b2f07d8c7a049615b0_goplay_esp_vs_bel_l.png?w=480&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/16/thumbnails_f4ef2cbaaf1579873f27256d6db6492d_goplay_fra_vs_esp_l.png?w=480&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/19/thumbnails_e85556a330842786281959972df7fea2_goplay_por_vs_esp_l.png?w=480&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/19/thumbnails_7c4c09bbec4781622f2c8ce16dc09be8_goplay_por_vs_cro_l.png?w=480&q=75",
];

const footballDetails = [
  {
    title: "Portugal vs Spain",
    shortTitle: "POR vs ESP",
    round: "Round of 16",
    category: "FIFA Replay",
    description:
      "Watch Portugal face Spain in this thrilling FIFA World Cup replay.",
  },
  {
    title: "Argentina vs Egypt",
    shortTitle: "ARG vs EGY",
    round: "Round of 16",
    category: "FIFA Replay",
    description:
      "Relive Argentina against Egypt in this FIFA World Cup classic.",
  },
  {
    title: "France vs Morocco",
    shortTitle: "FRA vs MAR",
    round: "Quarter Finals",
    category: "FIFA Replay",
    description:
      "Watch France face Morocco in an exciting World Cup quarter-final.",
  },
  {
    title: "Brazil vs Norway",
    shortTitle: "BRA vs NOR",
    round: "Round of 16",
    category: "FIFA Replay",
    description:
      "Watch Brazil face Norway in an unforgettable World Cup encounter.",
  },
  {
    title: "Spain vs Belgium",
    shortTitle: "ESP vs BEL",
    round: "Quarter Finals",
    category: "FIFA Replay",
    description: "Spain and Belgium meet in this exciting World Cup replay.",
  },
  {
    title: "France vs Spain",
    shortTitle: "FRA vs ESP",
    round: "Semi Finals",
    category: "FIFA Replay",
    description:
      "Relive the FIFA World Cup semi-final between France and Spain.",
  },
  {
    title: "Portugal vs Croatia",
    shortTitle: "POR vs CRO",
    round: "Round of 32",
    category: "FIFA Replay",
    description:
      "Watch Portugal face Croatia in this memorable World Cup contest.",
  },
];

const firstSevenItems = footballDetails.map((item, index) => ({
  ...item,
  id: index + 1,
  image: cardImages[index % cardImages.length],
  hoverImage: hoverImages[index],
  path: `/football/replay-${index + 1}`,
}));

const secondSevenItems = footballDetails.map((item, index) => ({
  ...item,
  id: index + 8,
  title: `${item.title} Highlights`,
  category: "FIFA Highlights",
  description: `Watch the best moments from ${item.title} in this FIFA World Cup highlights presentation.`,
  image: cardImages[index % cardImages.length],
  hoverImage: hoverImages[index],
  path: `/football/replay-${index + 8}`,
}));

const footballItems = [...firstSevenItems, ...secondSevenItems];

const Football = () => {
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

  const handlePlay = (event, item) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Play:", item.path);
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
        className="football-background group/football relative mx-auto w-full max-w-[1920px] overflow-x-clip overflow-y-visible rounded-[14px] bg-center bg-no-repeat sm:rounded-[25px] lg:min-h-[625px] lg:rounded-[52px]"
        style={{
          "--football-mobile-bg": `url("${FOOTBALL_MOBILE_BACKGROUND}")`,
          "--football-desktop-bg": `url("${FOOTBALL_DESKTOP_BACKGROUND}")`,
        }}
      >
        {/* Mobile readability overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black/5 lg:bg-transparent" />

        {/* Fixed-width content */}
        <div className="relative z-10 mx-auto flex min-h-[375px] w-full max-w-[1680px] flex-col justify-end px-4 pb-3 pt-[70px] sm:min-h-[480px] sm:px-6 sm:pb-6 sm:pt-[160px] lg:min-h-[625px] lg:px-10 lg:pb-8 lg:pt-[260px] xl:px-[42px]">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5">
            <h2 className="text-[19px] font-semibold tracking-[-0.4px] text-white sm:text-[25px] lg:text-[30px]">
              FIFA Rewind
            </h2>

            {/* Mobile: visible; desktop: section hover করলে visible */}
            <NavLink
              to="/football"
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
              {footballItems.map((item, index) => (
                <SwiperSlide key={item.id} className="football-card-slide">
                  <div className="group/card relative w-full cursor-pointer">
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

                          <span className="absolute right-1.5 top-1.5 z-10 rounded-[3px] bg-[#5ce8ef] px-1.5 py-[4px] text-[7px] font-semibold leading-none text-[#063238] sm:right-2 sm:top-2 sm:px-2 sm:text-[9px] lg:text-[10px]">
                            Replay
                          </span>
                        </div>

                        <h3
                          title={item.title}
                          className="mt-[6px] truncate px-0.5 text-center text-[9px] font-semibold text-white sm:text-[11px] lg:text-[12px]"
                        >
                          {item.shortTitle} | FIFA World Cup
                        </h3>
                      </article>
                    </NavLink>

                    {/* Desktop hover preview */}
                    <div className="pointer-events-none absolute bottom-[-4px] left-1/2 z-[9999] hidden w-[385px] -translate-x-1/2 translate-y-3 overflow-hidden rounded-[11px] border border-white/15 bg-[#182022] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.75)] transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:block">
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

                        <span className="absolute right-3 top-3 rounded-[4px] bg-[#5ce8ef] px-2.5 py-[5px] text-[10px] font-semibold text-[#063238]">
                          Replay
                        </span>
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
