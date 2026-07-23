import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, Share2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

const FREE_MOVIE_DESKTOP_BACKGROUND =
  "https://asset.bioscopelive.com/uploads/images/2026/05/11/thumbnail_backgrounds_28a3a697b1aeef449bb7e55cc1b8192b_goplay_king_of_d_8.png";

const FREE_MOVIE_MOBILE_BACKGROUND =
  "https://asset.bioscopelive.com/uploads/images/2026/05/12/poster_backgrounds_76bd705d7bfc7c6cce5d6f67db691a01_goplay_enjoy_f_for_phone_2.png?w=1920&q=75";

const movieImages = [
  "https://asset.bioscopelive.com/uploads/images/2025/09/22/posters_349d0f6eb82903463dca8ca945a4329a_goplay_nabab_llb.png",

  "https://asset.bioscopelive.com/uploads/images/2026/05/05/posters_fca0547acb9f4164fa1d543fdd5174ab_goplay_tumi_amar_prem_prot.png",

  "https://asset.bioscopelive.com/uploads/images/2026/05/05/posters_4b50e977ad3532ba594126ad1532792a_goplay_adorer_jamai_prot.png",

  "https://asset.bioscopelive.com/uploads/images/2026/02/05/posters_fb1d8df99be34d0a36a1c2341de5c20c_goplay_bir_prot.png",
];

const baseMovies = [
  {
    title: "Nabab LLB",
    category: "Drama",
    description:
      "Watch Nabab LLB and enjoy an exciting story featuring your favourite stars.",
  },
  {
    title: "Tumi Amar Prem",
    category: "Romance",
    description:
      "A beautiful romantic story about love, relationships and unexpected challenges.",
  },
  {
    title: "Adorer Jamai",
    category: "Comedy",
    description:
      "Enjoy a fun-filled family story packed with comedy, romance and entertainment.",
  },
  {
    title: "Bir",
    category: "Action",
    description:
      "An action-packed movie starring Shakib Khan, now available to watch for free.",
  },
];

const movieTitleVersions = [
  ["Nabab LLB", "Tumi Amar Prem", "Adorer Jamai", "Bir"],
  [
    "Nabab LLB Special",
    "Tumi Amar Prem Special",
    "Adorer Jamai Special",
    "Bir Special",
  ],
  [
    "Nabab LLB Full Movie",
    "Tumi Amar Prem Full Movie",
    "Adorer Jamai Full Movie",
    "Bir Full Movie",
  ],
];

/* ৪টি image তিনবার ব্যবহার করে মোট ১২টি card */
const freeMovies = Array.from({ length: 12 }, (_, index) => {
  const movieIndex = index % movieImages.length;
  const versionIndex = Math.floor(index / movieImages.length);

  return {
    ...baseMovies[movieIndex],
    id: index + 1,
    title: movieTitleVersions[versionIndex][movieIndex],
    image: movieImages[movieIndex],
    badge: index % 3 === 0 ? "Exclusive" : "Free",
    path: `/watch/free-movie-${index + 1}`,
  };
});

const FreeMovie = () => {
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
    <section className="group/free-movie relative isolate w-full overflow-hidden bg-[#111618]/95 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <picture>
          {/* Desktop background */}
          <source
            media="(min-width: 1024px)"
            srcSet={FREE_MOVIE_DESKTOP_BACKGROUND}
          />

          {/* Mobile and tablet background */}
          <img
            src={FREE_MOVIE_MOBILE_BACKGROUND}
            alt=""
            draggable={false}
            fetchPriority="high"
            className="h-full w-full select-none object-cover object-top"
          />
        </picture>

        <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#087cca]/55 via-[#087cca]/20 to-transparent" />
      </div>

      {/* Header এবং slider একই boundary container-এ */}
      <div className="relative mx-auto flex min-h-[500px] w-full max-w-[1680px] flex-col justify-end px-4 pb-[68px] pt-[145px] sm:min-h-[550px] sm:px-6 sm:pb-[72px] sm:pt-[185px] lg:min-h-[700px] lg:px-10 lg:pb-9 lg:pt-[310px] xl:px-[42px]">
        {/* Header */}
        <div className="relative z-10 mb-4 flex items-center justify-between">
          <h2 className="text-[21px] font-semibold tracking-[-0.4px] text-white drop-shadow-md sm:text-[25px] lg:text-[29px]">
            Shakib Khan&apos;s Free Movie
          </h2>

          <NavLink
            to="/free-movies"
            className="flex h-[31px] cursor-pointer items-center gap-1 rounded-[7px] bg-[#142231]/95 px-3 text-[11px] font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#23394e] sm:h-[34px] sm:text-[12px] lg:invisible lg:h-[36px] lg:px-4 lg:text-[13px] lg:opacity-0 lg:group-hover/free-movie:visible lg:group-hover/free-movie:opacity-100"
          >
            <span>See All</span>
            <span aria-hidden="true">→</span>
          </NavLink>
        </div>

        {/* Same boundary as Trending */}
        <div className="free-movie-slider-boundary relative">
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
            className="free-movie-swiper"
          >
            {freeMovies.map((movie, index) => (
              <SwiperSlide key={movie.id} className="free-movie-slide">
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
                          className="h-full w-full select-none object-cover transition-transform duration-500 group-hover/movie:scale-[1.025]"
                        />

                        <span
                          className={`absolute right-2 top-2 rounded-[4px] px-2 py-[5px] text-[8px] font-semibold leading-none sm:text-[9px] lg:text-[11px] ${
                            movie.badge === "Exclusive"
                              ? "bg-[#5ce8ef] text-[#063238]"
                              : "bg-white text-[#111618]"
                          }`}
                        >
                          {movie.badge}
                        </span>
                      </div>

                      <h3 className="mt-2 truncate px-1 text-center text-[11px] font-semibold text-white/90 sm:text-[12px] lg:hidden">
                        {movie.title}
                      </h3>
                    </article>
                  </NavLink>

                  {/* Desktop hover preview */}
                  <div className="free-movie-hover-preview pointer-events-none absolute bottom-[-5px] left-1/2 z-[100] hidden w-[385px] -translate-x-1/2 translate-y-3 overflow-hidden rounded-[12px] border border-white/15 bg-[#182022] opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover/movie:pointer-events-auto group-hover/movie:translate-y-0 group-hover/movie:opacity-100 lg:block">
                    <NavLink
                      to={movie.path}
                      className="block h-[216px] w-full cursor-pointer overflow-hidden bg-[#101719]"
                    >
                      <img
                        src={movie.image}
                        alt={movie.title}
                        draggable={false}
                        className="h-full w-full select-none object-cover transition-transform duration-500 hover:scale-[1.025]"
                      />
                    </NavLink>

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
                            aria-label="Add to my list"
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

          {!isBeginning && (
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous free movies"
              className="invisible absolute bottom-[77px] left-2 z-[120] hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.5)] backdrop-blur-lg transition-all duration-300 group-hover/free-movie:visible group-hover/free-movie:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronLeft size={28} strokeWidth={1.7} />
            </button>
          )}

          {!isEnd && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next free movies"
              className="invisible absolute bottom-[77px] right-0 z-[120] hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#202729]/95 text-white opacity-0 shadow-[0_5px_20px_rgba(0,0,0,0.5)] backdrop-blur-lg transition-all duration-300 group-hover/free-movie:visible group-hover/free-movie:opacity-100 hover:scale-105 hover:bg-[#31393b] active:scale-95 lg:flex"
            >
              <ChevronRight size={28} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </div>

      <style>
        {`
          /*
           * Trending component-এর মতো boundary।
           */
          .free-movie-slider-boundary {
            width: 100%;
            max-width: 100%;
          }

          .free-movie-swiper {
            width: 100%;
            max-width: 100%;
            overflow: visible;
            padding-top: 0;
            padding-bottom: 6px;
          }

          .free-movie-swiper .swiper-wrapper {
            align-items: flex-start;
          }

          .free-movie-slide {
            width: 220px;
            overflow: visible;
          }

          @media (min-width: 390px) {
            .free-movie-slide {
              width: 245px;
            }
          }

          @media (min-width: 480px) {
            .free-movie-slide {
              width: 270px;
            }
          }

          @media (min-width: 640px) {
            .free-movie-slide {
              width: 290px;
            }
          }

          @media (min-width: 768px) {
            .free-movie-slide {
              width: 305px;
            }
          }

          @media (min-width: 1024px) {
            /*
             * Boundary উপরের দিকে 220px বাড়ানো হয়েছে।
             * ফলে hover preview সম্পূর্ণ দেখা যাবে,
             * কিন্তু cards/header-এর horizontal boundary ছাড়াবে না।
             */
            .free-movie-slider-boundary {
              overflow: hidden;
              border-radius: 10px;
              padding-top: 220px;
              margin-top: -220px;
            }

            .free-movie-swiper {
              overflow: visible;
              padding-top: 0;
              padding-bottom: 14px;
            }

            .free-movie-slide {
              width: 318px;
              overflow: visible;
            }

            .free-movie-slide:hover {
              z-index: 100;
            }

            .free-movie-hover-preview {
              z-index: 100;
            }
          }

          @media (min-width: 1280px) {
            .free-movie-slide {
              width: 320px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .free-movie-hover-preview {
              transition-duration: 100ms;
            }
          }
        `}
      </style>
    </section>
  );
};

export default FreeMovie;
