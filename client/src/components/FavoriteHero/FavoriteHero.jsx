import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router";
import { A11y, FreeMode, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";

const heroes = [
  {
    id: 1,
    name: "Salman Khan",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/02/thumbnails_56d25327416ac13049d27f6a50117e1e_goplay_salman_khan.png?w=320&q=75",
    path: "/hero/salman-khan",
  },
  {
    id: 2,
    name: "Shakib Khan",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/02/thumbnails_abc8f3317e21ed83c3af4b41822de915_goplay_shakib_khan_1.png?w=320&q=75",
    path: "/hero/shakib-khan",
  },
  {
    id: 3,
    name: "Afran Nisho",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/05/thumbnails_f7fb7e36d14483cc7a6994fa378923bd_goplay_afran_nisho.png?w=320&q=75",
    path: "/hero/afran-nisho",
  },
  {
    id: 4,
    name: "Chanchal Chowdhury",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/05/thumbnails_bd5a9893b631fbdf290dff7ae00d700a_goplay_chanchal_chowdhury_1.png?w=320&q=75",
    path: "/hero/chanchal-chowdhury",
  },
  {
    id: 5,
    name: "Vijay Sethupathi",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/02/thumbnails_da6731de3edb6a14c1c60ff6b70a1fab_goplay_vijay_setupati.png?w=320&q=75",
    path: "/hero/vijay-sethupathi",
  },
  {
    id: 6,
    name: "Mosharraf Karim",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/16/thumbnails_b347c885703ef6db0cbfa7c8fea61255_goplay_mosaraf_karim_1.png?w=320&q=75",
    path: "/hero/mosharraf-karim",
  },
  {
    id: 7,
    name: "Akshay Kumar",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/02/thumbnails_4996eca279c3a3358333a7e85d1f959f_goplay_akshay_kumar.png?w=320&q=75",
    path: "/hero/akshay-kumar",
  },
  {
    id: 8,
    name: "Arifin Shuvoo",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/02/thumbnails_28c84033908b40e6c5836a05116bf954_goplay_arifin_shuvo_1.png?w=320&q=75",
    path: "/hero/arifin-shuvoo",
  },
  {
    id: 9,
    name: "Pritom Hasan",
    image:
      "https://asset.bioscopelive.com/uploads/images/2026/04/02/thumbnails_67e48a7d7b7fb151a027aafa32510738_goplay_pritom_hasan.png?w=320&q=75",
    path: "/hero/pritom-hasan",
  },
];

const FavoriteHero = () => {
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
    <section className="group/heroes w-full overflow-hidden bg-[#111618] py-5 text-white sm:py-7 lg:py-8">
      {/* Fixed-width container */}
      <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-[42px]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
          <h2 className="text-[22px] font-semibold tracking-[-0.5px] text-white sm:text-[26px] lg:text-[30px]">
            Pick Your Favorite Hero
          </h2>

          {/* Mobile: visible; desktop: section hover করলে visible */}
          <NavLink
            to="/heroes"
            className="flex h-[31px] shrink-0 cursor-pointer items-center gap-1 rounded-[7px] bg-[#192532] px-3 text-[10px] font-semibold text-white transition-all duration-300 hover:bg-[#273748] sm:h-[34px] sm:text-[12px] lg:invisible lg:h-[36px] lg:px-4 lg:text-[13px] lg:opacity-0 lg:group-hover/heroes:visible lg:group-hover/heroes:opacity-100"
          >
            <span>See All</span>
            <span aria-hidden="true">→</span>
          </NavLink>
        </div>

        {/* Hero slider */}
        <div className="favorite-hero-slider-boundary relative">
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
              390: {
                slidesPerView: "auto",
                spaceBetween: 10,
                freeMode: {
                  enabled: true,
                  momentum: true,
                  momentumBounce: false,
                  sticky: false,
                },
              },
              640: {
                slidesPerView: "auto",
                spaceBetween: 14,
                freeMode: {
                  enabled: true,
                  momentum: true,
                  momentumBounce: false,
                  sticky: false,
                },
              },
              768: {
                slidesPerView: "auto",
                spaceBetween: 16,
              },

              /*
               * Desktop-এ ঠিক ৮টি সম্পূর্ণ hero card।
               */
              1024: {
                slidesPerView: 8,
                slidesPerGroup: 1,
                spaceBetween: 16,
                freeMode: {
                  enabled: false,
                },
              },
              1280: {
                slidesPerView: 8,
                slidesPerGroup: 1,
                spaceBetween: 18,
                freeMode: {
                  enabled: false,
                },
              },
              1536: {
                slidesPerView: 8,
                slidesPerGroup: 1,
                spaceBetween: 20,
                freeMode: {
                  enabled: false,
                },
              },
            }}
            className="favorite-hero-swiper"
          >
            {heroes.map((hero, index) => (
              <SwiperSlide key={hero.id} className="favorite-hero-slide">
                <NavLink
                  to={hero.path}
                  aria-label={`View ${hero.name}`}
                  className="block w-full cursor-pointer"
                >
                  {/* Hero image—কোনো hover animation নেই */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-[10px] border border-white/15 bg-[#171d20]">
                    <img
                      src={hero.image}
                      alt={hero.name}
                      draggable={false}
                      loading={index < 4 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full select-none object-cover"
                    />
                  </div>

                  {/* Mobile hero name */}
                  <h3 className="mt-2 truncate px-1 text-center text-[10px] font-semibold text-[#d0d4d5] sm:text-[11px] lg:hidden">
                    {hero.name}
                  </h3>
                </NavLink>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Previous button */}
          {!isBeginning && (
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous heroes"
              className="invisible absolute left-1 top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#252c2e]/95 text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/heroes:visible group-hover/heroes:opacity-100 hover:scale-105 hover:bg-[#343c3e] active:scale-95 lg:flex"
            >
              <ChevronLeft size={25} strokeWidth={1.8} />
            </button>
          )}

          {/* Next button */}
          {!isEnd && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next heroes"
              className="invisible absolute right-1 top-1/2 z-50 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#252c2e]/95 text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-lg transition-all duration-300 group-hover/heroes:visible group-hover/heroes:opacity-100 hover:scale-105 hover:bg-[#343c3e] active:scale-95 lg:flex"
            >
              <ChevronRight size={25} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          /*
           * প্রথম ৮টি card-এর পর অন্য card-এর
           * কোনো অংশ desktop-এ দেখা যাবে না।
           */
          .favorite-hero-slider-boundary {
            position: relative;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
          }

          .favorite-hero-swiper {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            padding-bottom: 8px;
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          .favorite-hero-swiper .swiper-wrapper {
            align-items: flex-start;
            will-change: transform;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          /*
           * Mobile card sizes
           */
          .favorite-hero-slide {
            width: 125px;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
          }

          .favorite-hero-slide img {
            backface-visibility: hidden;
          }

          @media (min-width: 390px) {
            .favorite-hero-slide {
              width: 135px;
            }
          }

          @media (min-width: 480px) {
            .favorite-hero-slide {
              width: 145px;
            }
          }

          @media (min-width: 640px) {
            .favorite-hero-slide {
              width: 165px;
            }
          }

          @media (min-width: 768px) {
            .favorite-hero-slide {
              width: 180px;
            }
          }

          /*
           * Desktop width Swiper calculate করবে,
           * যাতে ঠিক ৮টি সম্পূর্ণ card দেখা যায়।
           */
          @media (min-width: 1024px) {
            .favorite-hero-slide {
              width: auto;
            }

            .favorite-hero-swiper {
              touch-action: auto;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .favorite-hero-swiper * {
              transition-duration: 100ms !important;
              animation-duration: 100ms !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default FavoriteHero;
