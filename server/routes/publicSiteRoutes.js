import express from "express";

import SiteIdentity from "../models/SiteIdentity.js";
import FooterLink from "../models/FooterLink.js";
import { ADS_SLOTS } from "../models/AdsSetting.js";
import { HOME_SECTION_KEYS } from "../models/HomeSection.js";
import HeroSlide from "../models/HeroSlide.js";
import Promotion, { PROMOTABLE_SECTIONS } from "../models/Promotion.js";
import Video from "../models/Video.js";
import StudioUser from "../models/StudioUser.js";

import { successResponse, errorResponse } from "../utils/response.js";
import { ensureHomeSection, ensureAdsSlot } from "../utils/siteDefaults.js";
import { publicVideo } from "../utils/videoSerializer.js";

const router = express.Router();

const summarizePromotedVideo = (video, studioUser) => ({
  id: video._id,
  title: video.title,
  description: video.description,
  thumbnail: video.thumbnail,
  duration: video.duration,
  category: video.category,
  maturityRating: video.maturityRating,
  channelName: studioUser?.channel?.name || studioUser?.fullName || "O-TV Studio",
});

// Single combined payload — every home page component reads its own slice
// from this instead of each firing a separate request.
router.get("/settings", async (req, res) => {
  try {
    const now = new Date();

    const [identity, footerLinks, adsList, homeSectionList, heroSlides, activePromotions, channels] =
      await Promise.all([
        SiteIdentity.findOne(),
        FooterLink.find().sort({ order: 1, createdAt: 1 }),
        Promise.all(ADS_SLOTS.map((slot) => ensureAdsSlot(slot))),
        Promise.all(HOME_SECTION_KEYS.map((key) => ensureHomeSection(key))),
        HeroSlide.find().sort({ order: 1, createdAt: 1 }),
        Promotion.find({
          status: "approved",
          startDate: { $lte: now },
          $or: [{ scheduleType: "lifetime" }, { endDate: { $gte: now } }],
        })
          .sort({ startDate: -1 })
          .populate({ path: "video", match: { status: "active" } })
          .populate("studioUser", "fullName channel"),
        StudioUser.find({ "channel.featured": true }).select("fullName channel"),
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

    const promotedVideos = {};
    PROMOTABLE_SECTIONS.forEach((key) => {
      promotedVideos[key] = [];
    });

    activePromotions.forEach((promotion) => {
      // populate's `match` nulls out `video` when it doesn't satisfy the
      // filter (e.g. the video was later rejected/deleted) — skip those.
      if (!promotion.video) return;

      const summary = summarizePromotedVideo(promotion.video, promotion.studioUser);

      promotion.sections.forEach((section) => {
        if (promotedVideos[section]) promotedVideos[section].push(summary);
      });
    });

    return successResponse(res, "Site settings loaded", {
      logo: identity?.logo || null,
      footerLinks,
      ads,
      homeSections,
      heroSlides,
      promotedVideos,
      channels: channels.map((user) => ({
        id: user._id,
        name: user.channel.name,
        logo: user.channel.logo,
      })),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// Public video detail page — bumps the view counter and returns a few
// other active videos from the same channel for the "more from channel" row.
router.get("/videos/:id", async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      status: "active",
    }).populate("studioUser", "fullName channel");

    if (!video) {
      return errorResponse(res, "Video not found", 404);
    }

    await Video.updateOne({ _id: video._id }, { $inc: { views: 1 } });
    video.views = (video.views || 0) + 1;

    const moreFromChannel = await Video.find({
      studioUser: video.studioUser._id,
      status: "active",
      _id: { $ne: video._id },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("title thumbnail duration category");

    return successResponse(res, "Video loaded", {
      video: publicVideo(video, { includeOwner: true }),
      moreFromChannel,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// Public channel page — channel identity + all of its active videos.
router.get("/channels/:studioUserId", async (req, res) => {
  try {
    const studioUser = await StudioUser.findById(req.params.studioUserId).select(
      "fullName channel",
    );

    if (!studioUser || !studioUser.channel?.name) {
      return errorResponse(res, "Channel not found", 404);
    }

    const videos = await Video.find({
      studioUser: studioUser._id,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .select("title thumbnail duration category");

    return successResponse(res, "Channel loaded", {
      channel: {
        id: studioUser._id,
        name: studioUser.channel.name,
        logo: studioUser.channel.logo,
      },
      videos,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
