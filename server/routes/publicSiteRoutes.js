import express from "express";

import SiteIdentity from "../models/SiteIdentity.js";
import FooterLink from "../models/FooterLink.js";
import { ADS_SLOTS } from "../models/AdsSetting.js";
import { HOME_SECTION_KEYS } from "../models/HomeSection.js";
import HeroSlide from "../models/HeroSlide.js";
import Promotion, { PROMOTABLE_SECTIONS } from "../models/Promotion.js";
import Video, { CATEGORY_OPTIONS } from "../models/Video.js";
import StudioUser from "../models/StudioUser.js";
import LiveTvChannel from "../models/LiveTvChannel.js";
import ScheduledLiveTvChannel from "../models/ScheduledLiveTvChannel.js";
import { LIVE_TV_CATEGORIES } from "../models/liveTvCategories.js";
import AdCampaign from "../models/AdCampaign.js";

import { successResponse, errorResponse } from "../utils/response.js";
import { ensureHomeSection, ensureAdsSlot } from "../utils/siteDefaults.js";
import { publicVideo } from "../utils/videoSerializer.js";
import {
  resolveNowPlaying,
  resolveAllTimeVideo,
  resolveUpcoming,
} from "../utils/liveTvSchedule.js";

const router = express.Router();

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const summarizePromotedVideo = (video, studioUser) => ({
  id: video._id,
  title: video.title,
  description: video.description,
  thumbnail: video.thumbnail,
  duration: video.duration,
  category: video.category,
  maturityRating: video.maturityRating,
  channelName: studioUser?.channel?.name || studioUser?.fullName || "Pipra-TV Studio",
  video: video.video,
});

// Home page videos per row are capped here so the single settings payload
// stays small even as promotions grow — most recent 20 per section (the
// query below is already sorted newest-first, so capping while bucketing
// keeps that order).
const MAX_PROMOTED_PER_SECTION = 20;

// Single combined payload — every home page component reads its own slice
// from this instead of each firing a separate request. Kept as one call so
// the home page never fans out into a burst of per-section requests.
router.get("/settings", async (req, res) => {
  try {
    const now = new Date();

    const [
      identity,
      footerLinks,
      adsList,
      homeSectionList,
      heroSlides,
      activePromotions,
      channels,
      externalLiveTvChannels,
      scheduledLiveTvChannels,
    ] = await Promise.all([
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
      LiveTvChannel.find({ homeFeatured: true }),
      ScheduledLiveTvChannel.find({ homeFeatured: true }),
    ]);

    const liveTvChannels = [
      ...externalLiveTvChannels.map((c) => withChannelType(c, "external")),
      ...scheduledLiveTvChannels.map((c) => withChannelType(c, "scheduled")),
    ].sort(byChannelPriority);

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
        if (promotedVideos[section] && promotedVideos[section].length < MAX_PROMOTED_PER_SECTION) {
          promotedVideos[section].push(summary);
        }
      });
    });

    return successResponse(res, "Site settings loaded", {
      logo: identity?.logo || null,
      favicon: identity?.favicon || null,
      socialLinks: {
        facebook: identity?.socialLinks?.facebook || "",
        youtube: identity?.socialLinks?.youtube || "",
        telegram: identity?.socialLinks?.telegram || "",
      },
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
      liveTv: liveTvChannels,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// Currently-active in-player ad campaigns for a specific video or Live TV
// channel — global campaigns plus any single-targeted at this exact id.
router.get("/ad-campaigns", async (req, res) => {
  try {
    const { video, liveTv } = req.query || {};

    if (!video && !liveTv) {
      return errorResponse(res, "A video or liveTv target id is required", 400);
    }

    const now = new Date();

    const targetFilter = video
      ? {
          $or: [
            { videoScope: "all" },
            { videoScope: "single", targetVideo: video },
          ],
        }
      : {
          $or: [
            { liveTvScope: "all" },
            { liveTvScope: "single", targetLiveTvChannel: liveTv },
          ],
        };

    const campaigns = await AdCampaign.find({
      enabled: true,
      startDate: { $lte: now },
      $and: [
        { $or: [{ scheduleType: "lifetime" }, { endDate: { $gte: now } }] },
        targetFilter,
      ],
    }).sort({ createdAt: 1 });

    return successResponse(res, "Ad campaigns loaded", {
      campaigns: campaigns.map((campaign) =>
        campaign.type === "video"
          ? {
              id: campaign._id,
              type: campaign.type,
              video: campaign.video,
              skipAfterSeconds: campaign.skipAfterSeconds,
              clickUrl: campaign.clickUrl,
              firstDelaySeconds: campaign.firstDelaySeconds,
              intervalSeconds: campaign.intervalSeconds,
            }
          : {
              id: campaign._id,
              type: campaign.type,
              imageSections: campaign.imageSections,
              displayDurationSeconds: campaign.displayDurationSeconds,
              firstDelaySeconds: campaign.firstDelaySeconds,
              intervalSeconds: campaign.intervalSeconds,
            },
      ),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// Consolidated public video list — powers Movies/Natok/Sports (category +
// sort=random), New (sort=newest), Search (search=), and Shorts (sort=random).
router.get("/videos", async (req, res) => {
  try {
    const { category, search, sort, page: pageQuery, limit: limitQuery } =
      req.query || {};

    const filter = { status: "active" };

    if (typeof category === "string" && CATEGORY_OPTIONS.includes(category)) {
      filter.category = category;
    }

    if (typeof search === "string" && search.trim()) {
      filter.title = new RegExp(search.trim(), "i");
    }

    const limit = Math.max(1, Math.min(100, parseInt(limitQuery, 10) || 24));
    const selectFields =
      "title description thumbnail duration category maturityRating studioUser video";

    if (sort === "random") {
      const pool = await Video.find(filter)
        .populate("studioUser", "fullName channel")
        .limit(200)
        .select(selectFields);

      const videos = shuffle(pool)
        .slice(0, limit)
        .map((video) => summarizePromotedVideo(video, video.studioUser));

      return successResponse(res, "Videos loaded", {
        videos,
        total: videos.length,
        page: 1,
        totalPages: 1,
      });
    }

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .populate("studioUser", "fullName channel")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(selectFields),
      Video.countDocuments(filter),
    ]);

    return successResponse(res, "Videos loaded", {
      videos: videos.map((video) => summarizePromotedVideo(video, video.studioUser)),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
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

// Paginated/searchable directory of every creator channel (not just the
// admin-featured ones shown on the home page's AllChannel row).
router.get("/channels", async (req, res) => {
  try {
    const { search, page: pageQuery, limit: limitQuery } = req.query || {};

    const filter = { "channel.name": { $ne: null } };

    if (typeof search === "string" && search.trim()) {
      filter["channel.name"] = { $regex: search.trim(), $options: "i" };
    }

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(limitQuery, 10) || 24));

    const [users, total] = await Promise.all([
      StudioUser.find(filter)
        .select("fullName channel")
        .sort({ "channel.name": 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      StudioUser.countDocuments(filter),
    ]);

    return successResponse(res, "Channels loaded", {
      channels: users.map((user) => ({
        id: user._id,
        name: user.channel.name,
        logo: user.channel.logo,
      })),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
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

// External-stream channels (LiveTvChannel) and admin-uploaded scheduled
// channels (ScheduledLiveTvChannel) live in two entirely separate
// collections/models — neither shares a field with the other, so every
// public endpoint below tags each plain object with an explicit
// `channelType` itself (not stored in the DB) and merges the two lists,
// rather than querying one combined collection.
const withChannelType = (doc, channelType) => ({
  ...(doc.toObject ? doc.toObject() : doc),
  channelType,
});

// Pipra-TV (channelType "scheduled" — there's only ever one) always leads
// every merged channel list, ahead of every external channel regardless
// of `order`/`createdAt`; external channels are then sorted amongst
// themselves as before.
const byChannelPriority = (a, b) => {
  if (a.channelType !== b.channelType) {
    return a.channelType === "scheduled" ? -1 : 1;
  }
  return a.order !== b.order ? a.order - b.order : new Date(a.createdAt) - new Date(b.createdAt);
};

const findAnyChannelById = async (id) => {
  const [external, scheduled] = await Promise.all([
    LiveTvChannel.findById(id).catch(() => null),
    ScheduledLiveTvChannel.findById(id).catch(() => null),
  ]);

  if (external) return withChannelType(external, "external");
  if (scheduled) return withChannelType(scheduled, "scheduled");
  return null;
};

// Full Live TV directory — every managed channel (not just the
// home-featured ones already in the /settings bundle), paginated 48/page.
// For a "scheduled" channel (Pipra-TV), figures out which video should be
// playing right now and at what offset — either a scheduled slot, or
// (falling back) whichever video the endless "all time" pool loop is
// currently on. Returns null for "external" channels (they just play
// their streamUrl as-is) or a scheduled channel with nothing configured.
const UPCOMING_LOOKAHEAD_SECONDS = 5;

const buildNowPlaying = (channel) => {
  if (channel.channelType !== "scheduled") return null;

  const resolved = resolveNowPlaying(channel);
  const fallback = resolved ? null : resolveAllTimeVideo(channel.allTimeVideos, new Date());
  const result = resolved || fallback;
  if (!result?.video?.url) return null;

  // Lets the player start preloading the next scheduled video's file a
  // few seconds before it's due, so the actual switch is instant.
  const upcoming = resolveUpcoming(channel, new Date(), UPCOMING_LOOKAHEAD_SECONDS);

  return {
    video: { url: result.video.url },
    offsetSeconds: result.offsetSeconds,
    isFallback: !resolved,
    upcoming: upcoming?.video?.url
      ? { video: { url: upcoming.video.url }, startsInSeconds: upcoming.startsInSeconds }
      : null,
  };
};

router.get("/live-tv", async (req, res) => {
  try {
    const { search, page: pageQuery, limit: limitQuery } = req.query || {};

    const filter = {};

    if (typeof search === "string" && search.trim()) {
      filter.name = new RegExp(search.trim(), "i");
    }

    const page = Math.max(1, parseInt(pageQuery, 10) || 1);
    // The Live TV page renders every channel at once, grouped into category
    // sections, so it asks for the whole list in one go — a category split
    // across pages would make no sense. The cap stays high rather than
    // unbounded so a runaway request can't pull the entire collection.
    const limit = Math.max(1, Math.min(500, parseInt(limitQuery, 10) || 48));

    const [externalChannels, scheduledChannels] = await Promise.all([
      LiveTvChannel.find(filter),
      ScheduledLiveTvChannel.find(filter),
    ]);

    const combined = [
      ...externalChannels.map((c) => withChannelType(c, "external")),
      ...scheduledChannels.map((c) => withChannelType(c, "scheduled")),
    ].sort(byChannelPriority);

    const total = combined.length;
    const channels = combined.slice((page - 1) * limit, (page - 1) * limit + limit);

    return successResponse(res, "Live TV channels loaded", {
      channels,
      categories: LIVE_TV_CATEGORIES,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.get("/live-tv/:id", async (req, res) => {
  try {
    const channel = await findAnyChannelById(req.params.id);

    if (!channel) {
      return errorResponse(res, "Channel not found", 404);
    }

    const [externalRelated, scheduledRelated] = await Promise.all([
      LiveTvChannel.find({ _id: { $ne: channel._id } }),
      ScheduledLiveTvChannel.find({ _id: { $ne: channel._id } }),
    ]);

    const related = [
      ...externalRelated.map((c) => withChannelType(c, "external")),
      ...scheduledRelated.map((c) => withChannelType(c, "scheduled")),
    ]
      .sort(byChannelPriority)
      .slice(0, 12);

    const nowPlaying = buildNowPlaying(channel);

    return successResponse(res, "Live TV channel loaded", { channel, related, nowPlaying });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// Polled periodically by a "scheduled" channel's player to detect
// schedule transitions (e.g. one programmed video ending and the next
// one starting) without re-fetching the whole channel + related list.
router.get("/live-tv/:id/now-playing", async (req, res) => {
  try {
    const channel = await findAnyChannelById(req.params.id);

    if (!channel) {
      return errorResponse(res, "Channel not found", 404);
    }

    const nowPlaying = buildNowPlaying(channel);

    return successResponse(res, "Now playing loaded", { nowPlaying });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
