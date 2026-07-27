import express from "express";

import SiteIdentity from "../models/SiteIdentity.js";
import FooterLink from "../models/FooterLink.js";
import { ADS_SLOTS } from "../models/AdsSetting.js";
import { HOME_SECTION_KEYS } from "../models/HomeSection.js";
import HeroSlide from "../models/HeroSlide.js";

import { successResponse, errorResponse } from "../utils/response.js";
import { ensureHomeSection, ensureAdsSlot } from "../utils/siteDefaults.js";

const router = express.Router();

// Single combined payload — every home page component reads its own slice
// from this instead of each firing a separate request.
router.get("/settings", async (req, res) => {
  try {
    const [identity, footerLinks, adsList, homeSectionList, heroSlides] =
      await Promise.all([
        SiteIdentity.findOne(),
        FooterLink.find().sort({ order: 1, createdAt: 1 }),
        Promise.all(ADS_SLOTS.map((slot) => ensureAdsSlot(slot))),
        Promise.all(HOME_SECTION_KEYS.map((key) => ensureHomeSection(key))),
        HeroSlide.find().sort({ order: 1, createdAt: 1 }),
      ]);

    const ads = {};
    adsList.forEach((entry) => {
      ads[entry.slot] = { image: entry.image, url: entry.url, openInNewTab: entry.openInNewTab };
    });

    const homeSections = {};
    homeSectionList.forEach((entry) => {
      homeSections[entry.key] = {
        title: entry.title,
        backgroundDesktop: entry.backgroundDesktop,
        backgroundMobile: entry.backgroundMobile,
      };
    });

    return successResponse(res, "Site settings loaded", {
      logo: identity?.logo || null,
      footerLinks,
      ads,
      homeSections,
      heroSlides,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
