import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const LOGO_URL =
  "https://asset.bioscopelive.com/uploads/images/2025/07/28/images_d6ce912746f794656d087b55ef04100d_goplay_bios.png?w=560";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const t = useMemo(() => {
    return {
      badge: isBangla ? "পেজ পাওয়া যায়নি" : "PAGE NOT FOUND",
      title: isBangla ? "উফ! এই পেজটি হারিয়ে গেছে" : "Oops! This page went missing",
      desc: isBangla
        ? "আপনি যে কন্টেন্ট বা পেজটি খুঁজছেন তা হয়তো সরানো হয়েছে অথবা লিংকটি ভুল। চিন্তা নেই — সেরা মুভি, লাইভ টিভি আর স্পোর্টস হোমপেজেই আপনার জন্য অপেক্ষা করছে।"
        : "The page or content you’re looking for may have been moved, or the link is incorrect. No worries — the best movies, live TV and sports are waiting for you on the home page.",
      home: isBangla ? "হোমে ফিরে যান" : "Back to Home",
      back: isBangla ? "আগের পেজে যান" : "Go Back",
      tip: isBangla
        ? "টিপস: নেভবারের সার্চ আইকন থেকে মুভি বা শো খুঁজে দেখুন।"
        : "Tip: Use the search icon in the navbar to find movies or shows.",
      copyright: isBangla
        ? `© ${new Date().getFullYear()} O-TV — সর্বস্বত্ব সংরক্ষিত।`
        : `© ${new Date().getFullYear()} O-TV — All rights reserved.`,
    };
  }, [isBangla]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111618] px-4 py-16 text-white">
      {/* Ambient background glow, matches the site's cyan accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#16d6dc]/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#16d6dc]/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 flex justify-center"
        >
          <img
            src={LOGO_URL}
            alt="O-TV"
            draggable={false}
            className="h-auto w-[150px] select-none object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-[18px] border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:px-10 sm:py-12"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="bg-gradient-to-b from-[#5ce8ef] to-[#16d6dc] bg-clip-text text-7xl font-black leading-none text-transparent sm:text-8xl"
          >
            404
          </motion.div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#16d6dc]/30 bg-[#16d6dc]/10 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-[#5ce8ef] sm:text-xs">
            {t.badge}
          </div>

          <h1 className="mt-5 text-xl font-bold leading-snug text-white sm:text-2xl">
            {t.title}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#9fa6a8] sm:text-base">
            {t.desc}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-all duration-200 hover:scale-[1.02] hover:bg-[#16d6dc] active:scale-95 sm:w-auto"
            >
              <Home size={18} strokeWidth={2} />
              {t.home}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10 active:scale-95 sm:w-auto"
            >
              <ArrowLeft size={18} strokeWidth={2} />
              {t.back}
            </button>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/40 sm:text-sm">
            <Search size={14} />
            {t.tip}
          </p>
        </motion.div>

        <p className="mt-6 text-xs text-white/30 sm:text-sm">{t.copyright}</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
