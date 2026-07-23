import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const Notice = () => {
  const { isBangla } = useLanguage();

  const noticeText = useMemo(() => {
    return isBangla
      ? "প্রতিদিন নতুন মুভি ও লাইভ টিভি যুক্ত হচ্ছে! এখনই O-TV-এ উপভোগ করুন! প্রতিদিন নতুন মুভি ও লাইভ টিভি যুক্ত হচ্ছে! এখনই O-TV-এ উপভোগ করুন!"
      : "New movies and live TV added every day! Enjoy them now on O-TV! New movies and live TV added every day! Enjoy them now on O-TV!";
  }, [isBangla]);

  return (
    <div className="w-full bg-[#2b2b2b]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* yellow pill */}
        <div className="bg-[#f5b400] rounded-md sm:rounded-md px-3 sm:px-6 py-2 sm:py-3 overflow-hidden">
          <div className="notice-viewport">
            <div className="notice-single text-black font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">
              {noticeText}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .notice-viewport{
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        /* start from right outside, exit left outside, immediately restart */
        .notice-single{
          display: inline-block;
          will-change: transform;
          animation: noticeOne 16s linear infinite;
        }

        @keyframes noticeOne{
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        /* accessibility */
        @media (prefers-reduced-motion: reduce){
          .notice-single{
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Notice;
