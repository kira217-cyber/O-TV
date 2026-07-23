import React from "react";
import { NavLink } from "react-router";
import { FaFacebookF, FaYoutube } from "react-icons/fa";

const FOOTER_LOGO =
  "https://asset.bioscopelive.com/uploads/images/2025/07/28/images_d6ce912746f794656d087b55ef04100d_goplay_bios.png?w=560";

const GOOGLE_PLAY =
  "https://www.bioscopeplus.com/images/google-play.png?w=384&q=75";

const APPLE_STORE =
  "https://www.bioscopeplus.com/images/apple-play.png?w=256&q=75";

const ANDROID_TV =
  "https://www.bioscopeplus.com/images/android-tv.png?w=256&q=75";

const aboutLinks = [
  {
    label: "Term of Use",
    path: "/terms-of-use",
  },
  {
    label: "Privacy Policy",
    path: "/privacy-policy",
  },
];

const helpLinks = [
  {
    label: "Feedback",
    path: "/feedback",
  },
  {
    label: "Contact Us",
    path: "/contact-us",
  },
  {
    label: "FAQ",
    path: "/faq",
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-[#111618] text-white">
      <div className="mx-auto w-full max-w-[1680px] px-[14px] pb-4 pt-[6px] sm:px-8 sm:pt-10 lg:px-10 lg:pb-11 lg:pt-[50px] xl:px-[114px]">
        {/* =================================================
            TOP SECTION
        ================================================= */}
        <div className="flex flex-col items-center text-center md:grid md:min-h-[168px] md:grid-cols-[1.2fr_1fr_1fr] md:items-start md:gap-x-10 md:pb-0 md:text-left lg:grid-cols-[1.05fr_1.8fr_auto] lg:gap-16">
          {/* Logo */}
          <div className="flex w-full justify-center md:justify-start">
            <NavLink
              to="/"
              aria-label="O-TV Home"
              className="inline-flex cursor-pointer items-center"
            >
              <img
                src={FOOTER_LOGO}
                alt="O-TV"
                draggable={false}
                className="h-auto w-[205px] select-none object-contain sm:w-[235px] lg:w-[270px]"
              />
            </NavLink>
          </div>

          {/* About Us */}
          <div className="mt-[35px] md:mt-0">
            <h3 className="mb-[17px] text-[16px] font-semibold text-white">
              About Us
            </h3>

            <nav className="flex flex-col items-center gap-[13px] md:items-start">
              {aboutLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="cursor-pointer text-[14px] font-normal text-[#aeb4b6] transition-colors duration-200 hover:text-white sm:text-[15px]"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Help */}
          <div className="mt-[42px] md:mt-0 md:justify-self-start lg:min-w-[82px] lg:justify-self-end">
            <h3 className="mb-[17px] text-[16px] font-semibold text-white">
              Help
            </h3>

            <nav className="flex flex-col items-center gap-[13px] md:items-start">
              {helpLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="cursor-pointer text-[14px] font-normal text-[#aeb4b6] transition-colors duration-200 hover:text-white sm:text-[15px]"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* First divider */}
        <div className="mt-[27px] h-px w-full bg-[#313638] md:mt-0" />

        {/* =================================================
            DOWNLOAD AND SOCIAL SECTION
        ================================================= */}
        <div className="flex flex-col items-center py-[29px] text-center md:min-h-[143px] md:flex-row md:items-center md:justify-between md:py-0 md:text-left">
          {/* Download apps */}
          <div>
            <h3 className="mb-[18px] text-[15px] font-semibold text-white">
              Download App For
            </h3>

            {/* Mobile app buttons */}
            <div className="flex flex-col items-center md:hidden">
              <div className="flex items-center justify-center gap-5">
                <a
                  href="https://play.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download from Google Play"
                  className="flex h-[40px] w-[135px] cursor-pointer items-center overflow-hidden rounded-[5px] border border-white/15 bg-black transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:brightness-110"
                >
                  <img
                    src={GOOGLE_PLAY}
                    alt="Get it on Google Play"
                    draggable={false}
                    className="h-full w-full select-none object-contain"
                  />
                </a>

                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download from Apple App Store"
                  className="flex h-[40px] w-[135px] cursor-pointer items-center overflow-hidden rounded-[5px] border border-white/15 bg-black transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:brightness-110"
                >
                  <img
                    src={APPLE_STORE}
                    alt="Download on the App Store"
                    draggable={false}
                    className="h-full w-full select-none object-contain"
                  />
                </a>
              </div>

              <a
                href="https://play.google.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Download for Android TV"
                className="mt-[11px] flex h-[40px] w-[137px] cursor-pointer items-center overflow-hidden rounded-[5px] border border-white/15 bg-black transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:brightness-110"
              >
                <img
                  src={ANDROID_TV}
                  alt="Android TV"
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              </a>
            </div>

            {/* Desktop app buttons */}
            <div className="hidden items-center gap-5 md:flex">
              <a
                href="https://play.google.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Download from Google Play"
                className="flex h-[40px] w-[136px] cursor-pointer items-center overflow-hidden rounded-[5px] border border-white/15 bg-black transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:brightness-110"
              >
                <img
                  src={GOOGLE_PLAY}
                  alt="Get it on Google Play"
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              </a>

              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noreferrer"
                aria-label="Download from Apple App Store"
                className="flex h-[40px] w-[135px] cursor-pointer items-center overflow-hidden rounded-[5px] border border-white/15 bg-black transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:brightness-110"
              >
                <img
                  src={APPLE_STORE}
                  alt="Download on the App Store"
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              </a>

              <a
                href="https://play.google.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Download for Android TV"
                className="flex h-[40px] w-[137px] cursor-pointer items-center overflow-hidden rounded-[5px] border border-white/15 bg-black transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:brightness-110"
              >
                <img
                  src={ANDROID_TV}
                  alt="Android TV"
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                />
              </a>
            </div>
          </div>

          {/* Social media */}
          <div className="mt-[42px] md:mt-0 md:text-right">
            <h3 className="mb-[18px] text-[15px] font-semibold text-white">
              Follow Us
            </h3>

            <div className="flex items-center justify-center gap-3 md:justify-end">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on Facebook"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#272d2f] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1877f2]"
              >
                <FaFacebookF size={18} />
              </a>

              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow us on YouTube"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#272d2f] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ff0000]"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Second divider */}
        <div className="h-px w-full bg-[#313638]" />

        {/* Copyright */}
        <div className="flex items-center justify-center pb-0 pt-[15px] text-center md:pb-1 md:pt-[26px]">
          <p className="whitespace-nowrap text-[11px] leading-5 text-[#aeb4b6] sm:text-[13px]">
            © All rights reserved | 2026 Grameenphone Ltd
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
