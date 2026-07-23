import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, Share2 } from "lucide-react";
import { NavLink } from "react-router";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const images = [
  "https://asset.bioscopelive.com/uploads/images/2026/07/20/posters_cd783f8ad7f84b89303d114e20a6fb91_goplay_esp_vs_arg_p.png?w=1920&q=75",

  "https://cms-cdn-bucket-prod.lionmultiverse.com/Media/THESENTINELSY_2025_SEN_Portrait_poster_76a67132c7.jpg",

  "https://asset.bioscopelive.com/uploads/images/2026/07/16/posters_05b2dbcd73bd49dc32dc45da0671d4cc_goplay_lpl_2026_bioscope_p.jpg?w=320&q=75",

  "https://origin-staticv2.sonyliv.com/videoasset_images/blitz_assets/1090536118/portraitThumb/1783154337635_1783151324207857_Balti_Portrait_Thumb_Dated_Rev.jpg?w=320",

  "https://image.chorkicdn.com/uploads/images/2026/06/20/posters_b9779a31bc2de03175100604883100af_goplay_wn.jpg?w=128",

  "https://img.rockstreamer.com/220xauto/images/rX7AXzT1h2Ye0gW5we4A.jpg?w=256&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/22/posters_dac16f6e0cfcae37254e8d9a19a79778_goplay_jaffna_vs_colombo_3_30pm_22july_p.jpg?w=256&q=75",
];

const hoverImages = [
  "https://asset.bioscopelive.com/uploads/images/2026/07/22/thumbnails_cfb121ea1074ee7d98649ef558656463_goplay_esp_vs_arg_l.png",

  "https://cms-cdn-bucket-prod.lionmultiverse.com/Media/THESENTINELSY_2025_SEN_Landscape_hero_main_50bce3042c.jpg?w=1920",

  "https://asset.bioscopelive.com/uploads/images/2026/07/22/thumbnails_ea636a515b6acc0eb5a2544202bdd44d_goplay_jaffna_vs_colombo_3_30pm_22july_l.jpg",

  "https://origin-staticv2.sonyliv.com/videoasset_images/manage_file/1000020328/1783090229595817_Balti_Landscape_Thumb.jpg?w=1920&q=75",

  "https://image.chorkicdn.com/uploads/images/2026/06/20/thumbnails_75c45f3483c9c9ac3cacb7fc1d26baf8_goplay_1200x675.jpg?w=1920",

  "https://img.rockstreamer.com/1280xauto/images/cppbTH0u5sp9WMN1DqAC.jpg?w=1080&q=75",

  "https://asset.bioscopelive.com/uploads/images/2026/07/22/thumbnails_ea636a515b6acc0eb5a2544202bdd44d_goplay_jaffna_vs_colombo_3_30pm_22july_l.jpg",
];

const baseDetails = [
  {
    title: "Spain vs Argentina",
    badge: "Exclusive",
    category: "Sports",
    description: "Spain vs Argentina live match on O-TV.",
  },
  {
    title: "The Sentinels",
    badge: "",
    category: "Series",
    description: "Watch The Sentinels exclusively on O-TV.",
  },
  {
    title: "LPL 2026",
    badge: "Exclusive",
    category: "Sports",
    description: "LPL T20 match live on iScreen.",
  },
  {
    title: "Balti",
    badge: "New Release",
    category: "Movie",
    description: "Stream Balti now, exclusively on O-TV.",
  },
  {
    title: "O-TV Special",
    badge: "New Release",
    category: "Drama",
    description: "Watch the latest O-TV special presentation.",
  },
  {
    title: "Featured Entertainment",
    badge: "Exclusive",
    category: "Entertainment",
    description: "Your favourite entertainment is streaming now.",
  },
  {
    title: "Jaffna Kings vs Colombo Kaps",
    badge: "Exclusive",
    category: "Sports",
    description: "LPL T20 match live on iScreen.",
  },
];

const firstSevenItems = baseDetails.map((item, index) => ({
  ...item,
  id: index + 1,
  image: images[index],
  hoverImage: hoverImages[index],
  path: `/watch/trending-${index + 1}`,
}));

const secondSevenItems = baseDetails.map((item, index) => ({
  ...item,
  id: index + 8,
  title:
    index === 0
      ? "Spain vs Argentina Highlights"
      : index === 1
        ? "The Sentinels Special"
        : index === 2
          ? "LPL 2026 Highlights"
          : index === 3
            ? "Balti Special"
            : index === 4
              ? "O-TV Special Episode"
              : index === 5
                ? "Featured Entertainment Special"
                : "Jaffna vs Colombo Highlights",
  image: images[index],
  hoverImage: hoverImages[index],
  path: `/watch/trending-${index + 8}`,
}));

const trendingItems = [...firstSevenItems, ...secondSevenItems];

const Trending = () => {
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
    <section className="group/trending w-full overflow-hidden bg-[#111618] py-5 text-white sm:py-6 lg:py-8">
      {/* Fixed-width container with left/right gap */}
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[22px] font-semibold tracking-[-0.5px] text-white sm:text-[26px] lg:text-[30px]">
            <span>Trending</span>

            <span
              role="img"
              aria-label="Trending"
              className="text-[21px] sm:text-[24px]"
            >
              📈
            </span>
          </h2>

          {/* Mobile: always visible */}
          {/* Desktop: section hover করলে visible */}
          <NavLink
            to="/trending"
            className="flex h-[31px] cursor-pointer items-center gap-1 rounded-[7px] bg-[#192532] px-3 text-[11px] font-semibold text-white transition-all duration-300 hover:bg-[#273748] sm:h-[34px] sm:text-[12px] lg:invisible lg:h-[36px] lg:px-4 lg:text-[13px] lg:opacity-0 lg:group-hover/trending:visible lg:group-hover/trending:opacity-100"
          >
            <span>See All</span>
            <span aria-hidden="true">→</span>
          </NavLink>
        </div>

        {/* Slider area */}
        <div className="trending-slider-boundary relative">
          <Swiper
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
            className="trending-swiper"
          >
            {trendingItems.map((item, index) => (
              <SwiperSlide key={item.id} className="trending-card-slide">
                <div className="group/card relative w-full cursor-pointer">
                  {/* Normal card */}
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
                          loading={index < 7 ? "eager" : "lazy"}
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

                  {/* =========================================
                      DESKTOP HOVER PREVIEW
                  ========================================= */}
                  <div className="pointer-events-none absolute bottom-[-4px] left-1/2 z-[100] hidden w-[385px] -translate-x-1/2 translate-y-3 overflow-hidden rounded-[11px] border border-white/15 bg-[#182022] opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.65)] transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100 lg:block">
                    {/* Preview landscape image */}
                    <NavLink
                      to={item.path}
                      className="block h-[216px] w-full cursor-pointer overflow-hidden bg-[#101517]"
                    >
                      <img
                        src={item.hoverImage}
                        alt={item.title}
                        draggable={false}
                        className="h-full w-full select-none object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </NavLink>

                    {/* Preview information */}
                    <div className="px-5 pb-5 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        {/* Action buttons */}
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

                        {/* Category */}
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

                      <p className="mt-2 truncate text-[13px] font-medium text-[#9fa6a8]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Desktop previous arrow */}
          {!isBeginning && (
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous trending items"
              className="invisible absolute left-2 top-[44%] z-[120] hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/trending:visible group-hover/trending:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronLeft size={28} strokeWidth={1.7} />
            </button>
          )}

          {/* Desktop next arrow */}
          {!isEnd && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next trending items"
              className="invisible absolute right-0 top-[44%] z-[120] hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/trending:visible group-hover/trending:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronRight size={28} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </div>

      <style>
        {`
    /*
     * Slider, cards এবং hover preview header-এর
     * একই left/right boundary-এর মধ্যে থাকবে।
     */
    .trending-slider-boundary {
      width: 100%;
      max-width: 100%;
    }

    .trending-swiper {
      overflow: visible;
      width: 100%;
      max-width: 100%;
      padding-top: 0;
      padding-bottom: 14px;
    }

    .trending-swiper .swiper-wrapper {
      align-items: flex-start;
    }

    .trending-card-slide {
      width: 128px;
      overflow: visible;
    }

    @media (min-width: 390px) {
      .trending-card-slide {
        width: 137px;
      }
    }

    @media (min-width: 480px) {
      .trending-card-slide {
        width: 150px;
      }
    }

    @media (min-width: 640px) {
      .trending-card-slide {
        width: 168px;
      }
    }

    @media (min-width: 768px) {
      .trending-card-slide {
        width: 185px;
      }
    }

    @media (min-width: 1024px) {
      /*
       * Desktop-এ horizontal content এবং hover preview
       * এই container-এর বাইরে যেতে পারবে না।
       */
      .trending-slider-boundary {
        overflow: hidden;
        border-radius: 10px;
      }

      .trending-swiper {
        overflow: visible;
        padding-top: 0;
        padding-bottom: 28px;
      }

      .trending-card-slide {
        width: 205px;
      }

      .trending-card-slide:hover {
        z-index: 100;
      }
    }

    @media (min-width: 1280px) {
      .trending-card-slide {
        width: 220px;
      }
    }

    @media (min-width: 1536px) {
      .trending-card-slide {
        width: 222px;
      }
    }
  `}
      </style>
    </section>
  );
};

export default Trending;
