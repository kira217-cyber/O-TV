import React from "react";
import { motion } from "framer-motion";
import { Info, Play, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { FreeMode, Keyboard, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";

const numberImages = [
  "https://www.bioscopeplus.com/images/numbers/web/1.svg?w=480&q=75",
  "https://www.bioscopeplus.com/images/numbers/small-screen/2.svg?w=828&q=75",
  "https://www.bioscopeplus.com/images/numbers/small-screen/3.svg?w=480&q=75",
  "https://www.bioscopeplus.com/images/numbers/small-screen/4.svg?w=480&q=75",
  "https://www.bioscopeplus.com/images/numbers/web/5.svg?w=828&q=75",
  "https://www.bioscopeplus.com/images/numbers/web/6.svg?w=480&q=75",
  "https://www.bioscopeplus.com/images/numbers/web/7.svg?w=480&q=75",
  "https://www.bioscopeplus.com/images/numbers/web/8.svg?w=828&q=75",
  "https://www.bioscopeplus.com/images/numbers/web/9.svg?w=480&q=75",
  "https://www.bioscopeplus.com/images/numbers/web/10.svg?w=828&q=75",
];

const movieImages = [
  "https://origin-staticv2.sonyliv.com/videoasset_images/manage_file/1000020328/1783090229819817_Balti_Portrait_Thumb_NewSeason.jpg?w=1920",
  "https://image.chorkicdn.com/uploads/images/2026/07/22/posters_910647eb6bc29d153bcba713003d92b4_goplay_800x1200jpg.jpeg?w=1920",
  "https://jcwsw2vt33.gpcdn.net/uploads/images/2022/08/09/posters_d700c0f6c101e8a97b1a67607d9ff7db_goplay_kosem_sultan_2.jpg?w=1800&q=75",
  "https://asset.bioscopelive.com/uploads/images/2025/03/10/images_df790b42b08683de99afb3997cef592e_goplay_golui_port.jpg",
];

const movieInformation = [
  {
    title: "Balti",
    duration: "2h 05m",
    year: "2026",
    rating: "U/A",
    path: "/movie/balti",
    exclusive: true,
  },
  {
    title: "Rockstar",
    duration: "2h 15m",
    year: "2026",
    rating: "G",
    path: "/movie/rockstar",
    exclusive: true,
  },
  {
    title: "Kosem Sultan",
    duration: "45m",
    year: "2025",
    rating: "U/A",
    path: "/movie/kosem-sultan",
    exclusive: false,
  },
  {
    title: "Golui",
    duration: "2h 10m",
    year: "2025",
    rating: "G",
    path: "/movie/golui",
    exclusive: true,
  },
  {
    title: "Balti: New Season",
    duration: "1h 58m",
    year: "2026",
    rating: "G",
    path: "/movie/balti-new-season",
    exclusive: true,
  },
  {
    title: "The Last Rockstar",
    duration: "2h 06m",
    year: "2026",
    rating: "U/A",
    path: "/movie/last-rockstar",
    exclusive: false,
  },
  {
    title: "Sultan's Empire",
    duration: "48m",
    year: "2025",
    rating: "U/A",
    path: "/movie/sultans-empire",
    exclusive: true,
  },
  {
    title: "Golui Returns",
    duration: "2h 02m",
    year: "2026",
    rating: "G",
    path: "/movie/golui-returns",
    exclusive: false,
  },
  {
    title: "Balti Special",
    duration: "1h 52m",
    year: "2026",
    rating: "G",
    path: "/movie/balti-special",
    exclusive: true,
  },
  {
    title: "Rockstar Live",
    duration: "2h 20m",
    year: "2026",
    rating: "U/A",
    path: "/movie/rockstar-live",
    exclusive: true,
  },
];

const topTenMovies = movieInformation.map((movie, index) => ({
  id: index + 1,
  rank: index + 1,
  ...movie,
  numberImage: numberImages[index],
  image: movieImages[index % movieImages.length],
}));

const TopTenMovie = () => {
  const navigate = useNavigate();

  const handlePlay = (movie) => {
    navigate(movie.path);
  };

  const handleAddToList = (event, movie) => {
    event.stopPropagation();
    console.log("Added to list:", movie.id);
  };

  const handleDetails = (event, movie) => {
    event.stopPropagation();
    navigate(movie.path);
  };

  return (
    <section className="w-full overflow-hidden bg-[#111618] py-5 sm:py-7 lg:py-9">
      {/* Section title */}
      <div className="mx-auto mb-4 w-full max-w-[1680px] px-4 sm:mb-5 sm:px-8 lg:px-10 xl:px-[120px]">
        <h2 className="text-[21px] font-semibold leading-none text-white sm:text-[25px] lg:text-[28px]">
          Top 10 Movies
        </h2>
      </div>

      {/* Movies slider */}
      <div className="mx-auto w-full max-w-[1920px]">
        <Swiper
          modules={[FreeMode, Keyboard, Mousewheel]}
          slidesPerView="auto"
          spaceBetween={12}
          grabCursor
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.75,
            momentumVelocityRatio: 0.75,
          }}
          keyboard={{
            enabled: true,
          }}
          mousewheel={{
            forceToAxis: true,
            releaseOnEdges: true,
          }}
          breakpoints={{
            640: {
              spaceBetween: 16,
            },
            1024: {
              spaceBetween: 22,
            },
            1440: {
              spaceBetween: 28,
            },
          }}
          className="top-ten-swiper !overflow-visible"
        >
          {topTenMovies.map((movie) => (
            <SwiperSlide
              key={movie.id}
              className="top-ten-slide !h-auto !w-[190px] sm:!w-[240px] lg:!w-[310px] xl:!w-[320px]"
            >
              <motion.article
                initial={false}
                whileHover={{
                  y: -5,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
                className="group relative w-full"
              >
                {/* Number and movie image */}
                <div className="relative h-[245px] w-full sm:h-[305px] lg:h-[355px]">
                  {/* Ranking number */}
                  <img
                    src={movie.numberImage}
                    alt={`Number ${movie.rank}`}
                    draggable={false}
                    className="pointer-events-none absolute bottom-[17px] left-0 z-0 h-[170px] w-[100px] select-none object-contain object-left-bottom sm:h-[220px] sm:w-[130px] lg:h-[275px] lg:w-[165px]"
                  />

                  {/* Movie card */}
                  <button
                    type="button"
                    onClick={() => handlePlay(movie)}
                    aria-label={`Watch ${movie.title}`}
                    className="absolute bottom-[23px] right-0 z-10 h-[205px] w-[137px] cursor-pointer overflow-hidden rounded-[9px] border border-white/15 bg-[#1d2224] text-left shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:z-30 group-hover:scale-[1.06] group-hover:border-white/30 group-hover:shadow-[0_18px_45px_rgba(0,0,0,0.55)] sm:h-[265px] sm:w-[177px] lg:h-[317px] lg:w-[212px] lg:rounded-[12px]"
                  >
                    <img
                      src={movie.image}
                      alt={movie.title}
                      draggable={false}
                      loading="lazy"
                      className="h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Exclusive badge */}
                    {movie.exclusive && (
                      <span className="absolute right-[6px] top-[7px] z-20 rounded-[3px] bg-[#59e9ee] px-[6px] py-[3px] text-[7px] font-semibold text-[#063136] sm:text-[8px] lg:right-2 lg:top-2 lg:px-2 lg:text-[10px]">
                        Exclusive
                      </span>
                    )}

                    {/* Hover dark gradient */}
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Hover details */}
                    <span className="absolute inset-x-0 bottom-0 z-20 translate-y-5 px-2.5 pb-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:px-3 lg:px-4 lg:pb-4">
                      <span className="block truncate text-[12px] font-semibold text-white sm:text-[14px] lg:text-[16px]">
                        {movie.title}
                      </span>

                      <span className="mt-1 flex items-center gap-1.5 text-[8px] font-medium text-white/80 sm:text-[9px] lg:text-[10px]">
                        <span>{movie.duration}</span>
                        <span>•</span>
                        <span>{movie.year}</span>
                        <span className="rounded-[2px] border border-white/40 px-1">
                          {movie.rating}
                        </span>
                      </span>

                      {/* Hover action buttons */}
                      <span className="mt-2 flex items-center gap-1.5 sm:gap-2">
                        <span className="flex h-7 flex-1 items-center justify-center gap-1 rounded-full bg-white text-[9px] font-semibold text-black transition-colors hover:bg-[#16d6dc] sm:h-8 sm:text-[10px] lg:h-9 lg:text-[12px]">
                          <Play
                            size={12}
                            fill="currentColor"
                            strokeWidth={1.8}
                          />
                          Play
                        </span>

                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => handleAddToList(event, movie)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleAddToList(event, movie);
                            }
                          }}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black sm:h-8 sm:w-8 lg:h-9 lg:w-9"
                        >
                          <Plus size={15} />
                        </span>

                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => handleDetails(event, movie)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleDetails(event, movie);
                            }
                          }}
                          className="hidden h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black sm:flex sm:h-8 sm:w-8 lg:h-9 lg:w-9"
                        >
                          <Info size={14} />
                        </span>
                      </span>
                    </span>
                  </button>
                </div>

                {/* Movie title */}
                <button
                  type="button"
                  onClick={() => handlePlay(movie)}
                  className="ml-auto block w-[137px] cursor-pointer truncate text-center text-[11px] font-semibold text-[#d2d5d6] transition-colors hover:text-white sm:w-[177px] sm:text-[13px] lg:w-[212px] lg:text-[14px]"
                >
                  {movie.title}
                </button>
              </motion.article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>
        {`
          .top-ten-swiper {
            padding-left: 16px;
            padding-right: 16px;
            padding-top: 10px;
            padding-bottom: 18px;
          }

          .top-ten-swiper .swiper-wrapper {
            align-items: flex-end;
          }

          @media (min-width: 640px) {
            .top-ten-swiper {
              padding-left: 32px;
              padding-right: 32px;
            }
          }

          @media (min-width: 1024px) {
            .top-ten-swiper {
              padding-left: 40px;
              padding-right: 40px;
              padding-top: 15px;
              padding-bottom: 25px;
            }
          }

          @media (min-width: 1680px) {
            .top-ten-swiper {
              padding-left: 120px;
              padding-right: 120px;
            }
          }

          @media (hover: none) {
            .top-ten-slide .group:active button {
              transform: scale(0.98);
            }
          }
        `}
      </style>
    </section>
  );
};

export default TopTenMovie;
