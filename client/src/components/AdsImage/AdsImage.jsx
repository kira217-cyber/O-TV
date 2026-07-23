import React from "react";

const ADS_IMAGE_URL =
  "https://asset.bioscopelive.com/uploads/images/2026/05/17/images_900c7e7c53593f400a244d99cd748ef0_goplay_bkash.png?w=1800";

const AdsImage = () => {
  const handleAdsClick = () => {
    console.log("Advertisement clicked");
  };

  return (
    <section className="w-full bg-[#111618] px-4 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-[42px] xl:px-[120px]">
      <div className="mx-auto w-full max-w-[1670px]">
        <button
          type="button"
          onClick={handleAdsClick}
          aria-label="View advertisement"
          className="group relative block h-[115px] w-full cursor-pointer overflow-hidden rounded-[8px] bg-[#124b9b] text-left shadow-[0_12px_35px_rgba(0,0,0,0.2)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.3)] focus-visible:ring-2 focus-visible:ring-[#16d6dc] min-[420px]:h-[130px] sm:h-auto sm:rounded-[10px] lg:rounded-[12px]"
        >
          <img
            src={ADS_IMAGE_URL}
            alt="O-TV and bKash advertisement"
            draggable={false}
            loading="lazy"
            className="block h-full w-full select-none object-cover object-center transition-transform duration-500 group-hover:scale-[1.01] sm:h-auto"
          />

          {/* Subtle hover shine */}
          <span className="ads-image-shine pointer-events-none absolute inset-y-0 left-0 w-[30%] -translate-x-[180%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100" />
        </button>
      </div>

      <style>
        {`
          .group:hover .ads-image-shine {
            animation: adsImageShine 1s ease-in-out;
          }

          @keyframes adsImageShine {
            0% {
              transform: translateX(-180%) skewX(-20deg);
              opacity: 0;
            }

            20% {
              opacity: 1;
            }

            100% {
              transform: translateX(520%) skewX(-20deg);
              opacity: 0;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .group:hover .ads-image-shine {
              animation: none;
            }
          }
        `}
      </style>
    </section>
  );
};

export default AdsImage;
