import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, Share2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { A11y, FreeMode, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";

const cardImages = [
  "https://img.rockstreamer.com/220xauto/images/LfnaexG8XV7PJ8sNJitU.png?w=320",

  "https://img.rockstreamer.com/220xauto/images/QxLHtBf6jHvOkjs1utsk.jpg?w=320",

  "https://klikk.co.in/api/uploads/mv/IMG1782455311.jpg?w=640",

  "https://origin-staticv2.sonyliv.com/portrait_thumb/aahat1_Portrait_Thumb.jpg?w=320",
];

const hoverImages = [
  "https://origin-staticv2.sonyliv.com/videoasset_images/manage_file/1000020273/1782995739268641_Karakkam_2jul_landscape_thumb.jpg?w=480&q=75",

  "https://image.hoichoicdn.com/unsafe/805a58db3d4f-4525-ac76-d176383745d6-Bhutopurbo_16x9-1.jpg?w=480&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/03/26/thumbnails_df88f89b14d07a403b00f597821fa679_goplay_chokro_2.jpg?w=480&q=75",

  "https://image.chorkicdn.com/uploads/images/2026/02/18/thumbnails_1991df59c1a6f202de10b9f625e400a9_goplay_1200x675.jpg?w=480&q=75",

  "https://image.hoichoicdn.com/unsafe/2716e1123817-4195-afa9-5c61d85ca9c7-16x9.jpg?w=480&q=75",

  "https://daex9l847wg3n.cloudfront.net/shemoutputimages/Page-16/660d770eb1e0d21ad672d686/xl_image_16_9_1769505251.jpg?1769505219?w=480&q=75",

  "https://image.hoichoicdn.com/unsafe/34d07d012708-4644-b30c-4f940ffa1c1b-16x9_WO_Date.jpg?w=480&q=75",

  "https://origin-staticv2.sonyliv.com/videoasset_images/darr_mall_2014_18sep_landscape_thumb.png?w=480&q=75",

  "https://image.chorkicdn.com/uploads/images/2024/12/18/thumbnails_6014a5314b11dd12160a2b8a4a6d6bff_goplay_1200x675_wn.jpg?w=480&q=75",

  "https://origin-staticv2.sonyliv.com/landscape_thumb/aahat1_landscape_Thumb.jpg?w=480&q=75",
];

const horrorDetails = [
  {
    title: "Karakkam",
    badge: "New Release",
    category: "Horror",
    description:
      "A terrifying mystery unfolds as an unknown force threatens everyone in its path.",
  },
  {
    title: "Bhutopurbo",
    badge: "Exclusive",
    category: "Supernatural",
    description:
      "A chilling supernatural story where the secrets of the past return to haunt the present.",
  },
  {
    title: "Chokro",
    badge: "Exclusive",
    category: "Thriller",
    description:
      "A deadly cycle of fear and mystery traps everyone who attempts to escape.",
  },
  {
    title: "The Haunted Night",
    badge: "New Release",
    category: "Horror",
    description:
      "One terrifying night changes everything when an unseen presence begins hunting its victims.",
  },
  {
    title: "Shadows of Fear",
    badge: "",
    category: "Mystery",
    description:
      "Dark shadows conceal a horrifying truth that was never meant to be discovered.",
  },
  {
    title: "The Possession",
    badge: "Exclusive",
    category: "Supernatural",
    description:
      "A family encounters a powerful supernatural force that refuses to let them escape.",
  },
  {
    title: "The Dark Secret",
    badge: "Exclusive",
    category: "Horror",
    description:
      "A hidden secret awakens an ancient evil and turns an ordinary night into a nightmare.",
  },
  {
    title: "Darr @ The Mall",
    badge: "New Release",
    category: "Horror",
    description:
      "A shopping mall becomes the setting for a terrifying night of supernatural horror.",
  },
  {
    title: "Whispers in the Dark",
    badge: "",
    category: "Thriller",
    description:
      "Mysterious whispers lead to a frightening discovery buried deep in the darkness.",
  },
  {
    title: "Aahat",
    badge: "Exclusive",
    category: "Horror Series",
    description:
      "Experience terrifying supernatural stories filled with mystery, fear and suspense.",
  },
];

const horrorItems = horrorDetails.map((item, index) => ({
  ...item,
  id: index + 1,
  image: cardImages[index % cardImages.length],
  hoverImage: hoverImages[index],
  path: `/watch/horror-${index + 1}`,
}));

const Horror = () => {
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
    <section className="group/horror w-full overflow-hidden bg-[#111618] py-5 text-white sm:py-6 lg:py-8">
      {/* Fixed-width container */}
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-[22px] font-semibold tracking-[-0.5px] text-white sm:text-[26px] lg:text-[30px]">
            <span>Horror</span>

            <span
              role="img"
              aria-label="Horror"
              className="text-[20px] sm:text-[23px]"
            >
              👻
            </span>
          </h2>

          {/* Mobile visible; desktop section hover করলে visible */}
          <NavLink
            to="/horror"
            className="flex h-[31px] shrink-0 cursor-pointer items-center gap-1 rounded-[7px] bg-[#192532] px-3 text-[10px] font-semibold text-white transition-all duration-300 hover:bg-[#273748] sm:h-[34px] sm:text-[12px] lg:invisible lg:h-[36px] lg:px-4 lg:text-[13px] lg:opacity-0 lg:group-hover/horror:visible lg:group-hover/horror:opacity-100"
          >
            <span>See All</span>
            <span aria-hidden="true">→</span>
          </NavLink>
        </div>

        {/* Slider */}
        <div className="horror-slider-boundary relative">
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
            touchRatio={1.15}
            threshold={3}
            longSwipes
            shortSwipes
            followFinger
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
                spaceBetween: 10,
                freeMode: {
                  enabled: true,
                  momentum: true,
                  momentumBounce: false,
                  sticky: false,
                },
              },
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
            className="horror-swiper"
          >
            {horrorItems.map((item, index) => (
              <SwiperSlide key={item.id} className="horror-card-slide">
                <div className="group/card relative w-full cursor-pointer">
                  {/* Normal portrait card */}
                  <NavLink
                    to={item.path}
                    aria-label={`Watch ${item.title}`}
                    className="block w-full cursor-pointer"
                  >
                    <article className="w-full">
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#182023]">
                        <img
                          src={item.image}
                          alt={item.title}
                          draggable={false}
                          loading={index < 4 ? "eager" : "lazy"}
                          decoding="async"
                          fetchPriority={index < 3 ? "high" : "auto"}
                          className="h-full w-full select-none object-cover"
                        />

                        {item.badge === "Exclusive" && (
                          <span className="absolute right-2 top-2 z-10 rounded-[4px] bg-[#5ce8ef] px-2 py-[5px] text-[8px] font-semibold leading-none text-[#063238] sm:text-[9px] lg:text-[11px]">
                            Exclusive
                          </span>
                        )}

                        {item.badge === "New Release" && (
                          <span className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-t-[4px] bg-[#4b63ed] px-4 py-[5px] text-[8px] font-semibold leading-none text-white sm:text-[9px] lg:text-[11px]">
                            New Release
                          </span>
                        )}
                      </div>

                      <h3
                        title={item.title}
                        className="mt-[7px] truncate px-1 text-center text-[11px] font-semibold text-[#c9cdcf] sm:text-[12px] lg:text-[14px]"
                      >
                        {item.title}
                      </h3>
                    </article>
                  </NavLink>

                  {/* Desktop hover preview */}
                  <div className="horror-hover-preview pointer-events-none absolute bottom-[-4px] left-1/2 z-[100] hidden w-[385px] -translate-x-1/2 translate-y-3 overflow-hidden rounded-[11px] border border-white/15 bg-[#182022] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.7)] transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:block">
                    {/* Landscape image */}
                    <NavLink
                      to={item.path}
                      className="block h-[216px] w-full cursor-pointer overflow-hidden bg-[#101517]"
                    >
                      <img
                        src={item.hoverImage}
                        alt={item.title}
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full select-none object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </NavLink>

                    {/* Preview information */}
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

                        <span className="max-w-[125px] truncate rounded-full bg-[#2b3032] px-3 py-[5px] text-[11px] font-semibold text-white">
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

                      <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-[19px] text-[#9fa6a8]">
                        {item.description}
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
              aria-label="Previous horror items"
              className="invisible absolute left-0 top-[60%] z-[120] hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/horror:visible group-hover/horror:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronLeft size={28} strokeWidth={1.7} />
            </button>
          )}

          {/* Next arrow */}
          {!isEnd && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next horror items"
              className="invisible absolute right-0 top-[60%] z-[120] hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/horror:visible group-hover/horror:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronRight size={28} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          .horror-slider-boundary {
            width: 100%;
            max-width: 100%;
          }

          .horror-swiper {
            position: relative;
            width: 100%;
            max-width: 100%;
            overflow: visible;
            padding-top: 0;
            padding-bottom: 14px;
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          .horror-swiper .swiper-wrapper {
            align-items: flex-start;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          .horror-card-slide {
            position: relative;
            width: 128px;
            overflow: visible;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          .horror-card-slide img {
            backface-visibility: hidden;
          }

          @media (min-width: 390px) {
            .horror-card-slide {
              width: 137px;
            }
          }

          @media (min-width: 480px) {
            .horror-card-slide {
              width: 150px;
            }
          }

          @media (min-width: 640px) {
            .horror-card-slide {
              width: 168px;
            }
          }

          @media (min-width: 768px) {
            .horror-card-slide {
              width: 185px;
            }
          }

          @media (min-width: 1024px) {
            /*
             * Hover preview-এর জন্য উপরের দিকে জায়গা রাখা হয়েছে।
             */
            .horror-slider-boundary {
              overflow: hidden;
              border-radius: 10px;
              padding-top: 220px;
              margin-top: -220px;
            }

            .horror-swiper {
              overflow: visible;
              padding-top: 0;
              padding-bottom: 28px;
              touch-action: auto;
            }

            .horror-card-slide {
              width: 205px;
            }

            .horror-card-slide:hover {
              z-index: 100;
            }

            .horror-hover-preview {
              z-index: 100;
            }
          }

          @media (min-width: 1280px) {
            .horror-card-slide {
              width: 220px;
            }
          }

          @media (min-width: 1536px) {
            .horror-card-slide {
              width: 222px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .horror-hover-preview {
              transition-duration: 100ms;
            }
          }
        `}
      </style>
    </section>
  );
};

export default Horror;
