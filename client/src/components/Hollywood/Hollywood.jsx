import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, Share2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { A11y, FreeMode, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";

const HOLLYWOOD_DESKTOP_BACKGROUND =
  "https://asset.bioscopelive.com/uploads/images/2026/02/02/thumbnail_backgrounds_2ecce0eec8885a0d9356ccf210c01107_goplay_hollywood_drop.png?w=1920&q=75";

const HOLLYWOOD_MOBILE_BACKGROUND =
  "https://asset.bioscopelive.com/uploads/images/2026/04/12/poster_backgrounds_d509fea351217249170da515fa1008ab_goplay_hollywood_phone.png?w=1920&q=75";

const hollywoodImages = [
  "https://cms-cdn-bucket-prod.lionmultiverse.com/Media/12_STRONG_0_Y2018_MEN_Landscape_hero_main_c105b17c70.jpg?w=480&q=75",

  "https://cms-cdn-bucket-prod.lionmultiverse.com/Media/LOGANLUCKYY_2017_MEN_Landscape_hero_main_2f31c93fb8.jpg?w=480&q=75",

  "https://origin-staticv2.sonyliv.com/videoasset_images/thefabelmans_english_multilang_landscape_thumb.jpg?w=480&q=75",

  "https://cms-cdn-bucket-prod.lionmultiverse.com/Media/HUNTERKILLERY_2018_MEN_Landscape_hero_main_f0aab1662a.jpg?w=480&q=75",

  "https://cms-cdn-bucket-prod.lionmultiverse.com/Media/HUNTERKILLERY_2018_MEN_Landscape_hero_main_f0aab1662a.jpg?w=480&q=75",

  "https://cms-cdn-bucket-prod.lionmultiverse.com/Media/JOHNWICKCHAPTER_2_Y2017_M_2_FJOHNWICKCHAPTER_2_Y2017_M_LGI_Landscape_Hero_Main_7c8819bab4.jpg?w=480&q=75",

  "https://cms-cdn-bucket-prod.lionmultiverse.com/Media/JOHNWICKY_2014_MEN_Landscape_Hero_Main_81ec5a9e2a.jpg?w=480&q=75",
];

const hollywoodDetails = [
  {
    title: "12 Strong",
    category: "Action",
    description:
      "A team of elite soldiers undertakes a dangerous mission in the aftermath of September 11.",
  },
  {
    title: "Logan Lucky",
    category: "Comedy",
    description:
      "Two brothers attempt an elaborate heist during a major racing event.",
  },
  {
    title: "The Fabelmans",
    category: "Drama",
    description:
      "A young filmmaker discovers the power of cinema while uncovering a family secret.",
  },
  {
    title: "Hunter Killer",
    category: "Action",
    description:
      "An American submarine captain joins an elite team on a dangerous rescue mission.",
  },
  {
    title: "Hunter Killer Special",
    category: "Thriller",
    description:
      "Experience a tense underwater mission filled with danger, courage and action.",
  },
  {
    title: "John Wick: Chapter 2",
    category: "Action",
    description:
      "John Wick is forced back into action by a former associate seeking control of a secret guild.",
  },
  {
    title: "John Wick",
    category: "Action",
    description:
      "A retired assassin returns to the dangerous world he left behind to seek justice.",
  },
];

const firstSevenMovies = hollywoodDetails.map((movie, index) => ({
  ...movie,
  id: index + 1,
  image: hollywoodImages[index],
  badge: "Exclusive",
  path: `/watch/hollywood-${index + 1}`,
}));

const secondSevenMovies = hollywoodDetails.map((movie, index) => ({
  ...movie,
  id: index + 8,
  title: `${movie.title} Special`,
  description: `Watch ${movie.title} in this special Hollywood blockbuster presentation.`,
  image: hollywoodImages[index],
  badge: index % 3 === 0 ? "New Release" : "Exclusive",
  path: `/watch/hollywood-${index + 8}`,
}));

const hollywoodMovies = [...firstSevenMovies, ...secondSevenMovies];

const Hollywood = () => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();

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
      console.log("Share URL:", shareUrl);
    }
  };

  return (
    <section className="group/hollywood relative isolate w-full overflow-hidden bg-[#111618]/95 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <picture>
          {/* Desktop background */}
          <source
            media="(min-width: 1024px)"
            srcSet={HOLLYWOOD_DESKTOP_BACKGROUND}
          />

          {/* Mobile and tablet background */}
          <img
            src={HOLLYWOOD_MOBILE_BACKGROUND}
            alt=""
            draggable={false}
            fetchPriority="high"
            className="h-full w-full select-none object-cover object-top"
          />
        </picture>

        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#8500a8]/65 via-[#8500a8]/25 to-transparent" />
      </div>

      {/* Fixed-width content */}
      <div className="relative mx-auto flex min-h-[500px] w-full max-w-[1680px] flex-col justify-end px-4 pb-[55px] pt-[145px] sm:min-h-[550px] sm:px-6 sm:pb-[65px] sm:pt-[185px] lg:min-h-[700px] lg:px-10 lg:pb-9 lg:pt-[310px] xl:px-[42px]">
        {/* Header */}
        <div className="relative z-10 mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[21px] font-semibold tracking-[-0.4px] text-white drop-shadow-md sm:text-[25px] lg:text-[29px]">
            Hollywood Blockbuster Legends
          </h2>

          {/* Mobile visible; desktop section hover করলে visible */}
          <NavLink
            to="/hollywood"
            className="flex h-[31px] shrink-0 cursor-pointer items-center gap-1 rounded-[7px] bg-[#142231]/95 px-3 text-[10px] font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#23394e] sm:h-[34px] sm:text-[12px] lg:invisible lg:h-[36px] lg:px-4 lg:text-[13px] lg:opacity-0 lg:group-hover/hollywood:visible lg:group-hover/hollywood:opacity-100"
          >
            <span>See All</span>
            <span aria-hidden="true">→</span>
          </NavLink>
        </div>

        {/* Slider */}
        <div className="hollywood-slider-boundary relative">
          <Swiper
            modules={[Keyboard, A11y, FreeMode]}
            slidesPerView="auto"
            slidesPerGroup={1}
            spaceBetween={10}
            speed={450}
            grabCursor
            watchOverflow
            resistance
            resistanceRatio={0.65}
            touchRatio={1.1}
            threshold={3}
            freeMode={{
              enabled: true,
              momentum: true,
              momentumRatio: 0.75,
              momentumVelocityRatio: 0.85,
              momentumBounce: false,
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
              480: {
                spaceBetween: 12,
              },
              640: {
                spaceBetween: 14,
              },
              768: {
                spaceBetween: 16,
              },
              1024: {
                spaceBetween: 20,
                freeMode: {
                  enabled: false,
                },
              },
            }}
            className="hollywood-swiper"
          >
            {hollywoodMovies.map((movie, index) => (
              <SwiperSlide key={movie.id} className="hollywood-slide">
                <div className="group/movie relative w-full cursor-pointer">
                  {/* Normal card */}
                  <NavLink
                    to={movie.path}
                    aria-label={`Watch ${movie.title}`}
                    className="block w-full cursor-pointer"
                  >
                    <article className="w-full">
                      <div className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-white/15 bg-[#182023] shadow-md">
                        <img
                          src={movie.image}
                          alt={movie.title}
                          draggable={false}
                          loading={index < 4 ? "eager" : "lazy"}
                          decoding="async"
                          className="h-full w-full select-none object-cover transition-transform duration-500 group-hover/movie:scale-[1.025]"
                        />

                        <span
                          className={`absolute right-2 top-2 rounded-[4px] px-2 py-[5px] text-[8px] font-semibold leading-none sm:text-[9px] lg:text-[11px] ${
                            movie.badge === "New Release"
                              ? "bg-[#5367ef] text-white"
                              : "bg-[#5ce8ef] text-[#063238]"
                          }`}
                        >
                          {movie.badge}
                        </span>
                      </div>

                      <h3 className="mt-2 truncate px-1 text-center text-[11px] font-semibold text-white/90 sm:text-[12px] lg:text-[14px]">
                        {movie.title}
                      </h3>
                    </article>
                  </NavLink>

                  {/* Desktop hover preview */}
                  <div className="hollywood-hover-preview pointer-events-none absolute bottom-[-5px] left-1/2 z-[100] hidden w-[385px] -translate-x-1/2 translate-y-3 overflow-hidden rounded-[12px] border border-white/15 bg-[#182022] opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover/movie:pointer-events-auto group-hover/movie:translate-y-0 group-hover/movie:opacity-100 lg:block">
                    {/* Preview image */}
                    <NavLink
                      to={movie.path}
                      className="relative block h-[216px] w-full cursor-pointer overflow-hidden bg-[#101719]"
                    >
                      <img
                        src={movie.image}
                        alt={movie.title}
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full select-none object-cover transition-transform duration-500 hover:scale-[1.025]"
                      />

                      <span
                        className={`absolute right-3 top-3 rounded-[4px] px-2.5 py-[5px] text-[10px] font-semibold ${
                          movie.badge === "New Release"
                            ? "bg-[#5367ef] text-white"
                            : "bg-[#5ce8ef] text-[#063238]"
                        }`}
                      >
                        {movie.badge}
                      </span>
                    </NavLink>

                    {/* Preview details */}
                    <div className="px-5 pb-5 pt-4">
                      <div className="flex items-center justify-between gap-3">
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

                        <span className="max-w-[125px] truncate rounded-full bg-[#2b3032] px-3 py-[5px] text-[11px] font-semibold text-white">
                          {movie.category}
                        </span>
                      </div>

                      <NavLink
                        to={movie.path}
                        className="mt-4 block cursor-pointer"
                      >
                        <h3 className="truncate text-[19px] font-semibold text-white transition-colors duration-200 hover:text-[#16d6dc]">
                          {movie.title}
                        </h3>
                      </NavLink>

                      <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[19px] text-[#a9afb1]">
                        {movie.description}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Previous button */}
          {!isBeginning && (
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous Hollywood movies"
              className="invisible absolute bottom-[77px] left-2 z-[120] hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.5)] backdrop-blur-lg transition-all duration-300 group-hover/hollywood:visible group-hover/hollywood:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronLeft size={28} strokeWidth={1.7} />
            </button>
          )}

          {/* Next button */}
          {!isEnd && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Hollywood movies"
              className="invisible absolute bottom-[77px] right-0 z-[120] hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.5)] backdrop-blur-lg transition-all duration-300 group-hover/hollywood:visible group-hover/hollywood:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronRight size={28} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          .hollywood-slider-boundary {
            width: 100%;
            max-width: 100%;
          }

          .hollywood-swiper {
            width: 100%;
            max-width: 100%;
            overflow: visible;
            padding-top: 0;
            padding-bottom: 6px;
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          .hollywood-swiper .swiper-wrapper {
            align-items: flex-start;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          .hollywood-slide {
            width: 220px;
            overflow: visible;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          @media (min-width: 390px) {
            .hollywood-slide {
              width: 245px;
            }
          }

          @media (min-width: 480px) {
            .hollywood-slide {
              width: 270px;
            }
          }

          @media (min-width: 640px) {
            .hollywood-slide {
              width: 290px;
            }
          }

          @media (min-width: 768px) {
            .hollywood-slide {
              width: 305px;
            }
          }

          @media (min-width: 1024px) {
            /*
             * Hover preview-এর জন্য উপরে জায়গা।
             */
            .hollywood-slider-boundary {
              overflow: hidden;
              border-radius: 10px;
              padding-top: 220px;
              margin-top: -220px;
            }

            .hollywood-swiper {
              overflow: visible;
              padding-top: 0;
              padding-bottom: 14px;
              touch-action: auto;
            }

            .hollywood-slide {
              width: 318px;
              overflow: visible;
            }

            .hollywood-slide:hover {
              z-index: 100;
            }

            .hollywood-hover-preview {
              z-index: 100;
            }
          }

          @media (min-width: 1280px) {
            .hollywood-slide {
              width: 320px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hollywood-hover-preview {
              transition-duration: 100ms;
            }
          }
        `}
      </style>
    </section>
  );
};

export default Hollywood;
