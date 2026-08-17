import express from "express";

import SiteIdentity from "../models/SiteIdentity.js";
import FooterLink from "../models/FooterLink.js";
import { ADS_SLOTS } from "../models/AdsSetting.js";
import {
  HOME_SECTION_KEYS,
  SECTIONS_WITH_BACKGROUND,
} from "../models/HomeSection.js";
import HeroSlide from "../models/HeroSlide.js";
import LiveTvChannel from "../models/LiveTvChannel.js";
import {
  LIVE_TV_CATEGORIES,
  parseLiveTvCategories,
} from "../models/liveTvCategories.js";
import { LIVE_TV_LIST_LIMIT, findFullListCategory } from "../utils/liveTvList.js";
import { loadLiveTvSourceChannels } from "../utils/liveTvSource.js";

import upload from "../config/multer.js";
import { handleUpload } from "../utils/handleUpload.js";
import { deleteLocalFile } from "../utils/videoFiles.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { ensureHomeSection, ensureAdsSlot } from "../utils/siteDefaults.js";

const router = express.Router();

router.use(protectAdmin);

/* =========================
   Site Identity (logo used by Navbar + Footer)
========================= */
router.get("/identity", async (req, res) => {
  try {
    let identity = await SiteIdentity.findOne();
    if (!identity) identity = await SiteIdentity.create({});

    return successResponse(res, "Site identity loaded", { identity });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/identity",
  handleUpload(upload.single("logo")),
  async (req, res) => {
    try {
      let identity = await SiteIdentity.findOne();
      if (!identity) identity = new SiteIdentity({});

      const previousLogo = identity.logo;

      if (req.file) {
        identity.logo = `/uploads/${req.file.filename}`;
      }

      const { facebook, youtube, telegram } = req.body || {};
      if (
        typeof facebook !== "undefined" ||
        typeof youtube !== "undefined" ||
        typeof telegram !== "undefined"
      ) {
        identity.socialLinks = {
          facebook: facebook?.trim() || "",
          youtube: youtube?.trim() || "",
          telegram: telegram?.trim() || "",
        };
      }

      await identity.save();

      if (req.file && previousLogo) deleteLocalFile(previousLogo);

      return successResponse(res, "Site logo updated", { identity });
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete("/identity", async (req, res) => {
  try {
    const identity = await SiteIdentity.findOne();
    if (!identity) return successResponse(res, "Site logo cleared", { identity: null });

    const previousLogo = identity.logo;
    identity.logo = null;
    await identity.save();

    if (previousLogo) deleteLocalFile(previousLogo);

    return successResponse(res, "Site logo cleared", { identity });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Site Favicon (browser tab icon of the client site)
   Kept on its own upload field/endpoints rather than folded into
   PUT /identity, so saving a logo or the social links never has to
   round-trip the favicon file back up with them.
========================= */
router.put(
  "/identity/favicon",
  handleUpload(upload.single("favicon")),
  async (req, res) => {
    try {
      if (!req.file) {
        return errorResponse(res, "A favicon image is required", 400);
      }

      let identity = await SiteIdentity.findOne();
      if (!identity) identity = new SiteIdentity({});

      const previousFavicon = identity.favicon;
      identity.favicon = `/uploads/${req.file.filename}`;

      await identity.save();

      if (previousFavicon) deleteLocalFile(previousFavicon);

      return successResponse(res, "Site favicon updated", { identity });
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete("/identity/favicon", async (req, res) => {
  try {
    const identity = await SiteIdentity.findOne();
    if (!identity) {
      return successResponse(res, "Site favicon cleared", { identity: null });
    }

    const previousFavicon = identity.favicon;
    identity.favicon = null;
    await identity.save();

    if (previousFavicon) deleteLocalFile(previousFavicon);

    return successResponse(res, "Site favicon cleared", { identity });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Ads Images (2 slots)
========================= */
router.get("/ads", async (req, res) => {
  try {
    const ads = await Promise.all(ADS_SLOTS.map((slot) => ensureAdsSlot(slot)));
    return successResponse(res, "Ads settings loaded", { ads });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/ads/:slot",
  handleUpload(upload.single("image")),
  async (req, res) => {
    try {
      const { slot } = req.params;

      if (!ADS_SLOTS.includes(slot)) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Invalid ads slot", 400);
      }

      const { url, openInNewTab } = req.body || {};

      const ads = await ensureAdsSlot(slot);
      const previousImage = ads.image;

      if (req.file) ads.image = `/uploads/${req.file.filename}`;
      if (typeof url === "string") ads.url = url.trim() || null;
      if (typeof openInNewTab !== "undefined") {
        ads.openInNewTab = openInNewTab === "true" || openInNewTab === true;
      }

      await ads.save();

      if (req.file && previousImage) deleteLocalFile(previousImage);

      return successResponse(res, "Ads setting updated", { ads });
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete("/ads/:slot", async (req, res) => {
  try {
    const { slot } = req.params;

    if (!ADS_SLOTS.includes(slot)) {
      return errorResponse(res, "Invalid ads slot", 400);
    }

    const ads = await ensureAdsSlot(slot);
    const previousImage = ads.image;

    ads.image = null;
    ads.url = null;
    await ads.save();

    if (previousImage) deleteLocalFile(previousImage);

    return successResponse(res, "Ads setting cleared", { ads });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Footer Download Links
========================= */
router.get("/footer-links", async (req, res) => {
  try {
    const links = await FooterLink.find().sort({ order: 1, createdAt: 1 });
    return successResponse(res, "Footer links loaded", { links });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/footer-links",
  handleUpload(upload.single("image")),
  async (req, res) => {
    try {
      const { label, url, openInNewTab } = req.body || {};

      if (!label?.trim() || !url?.trim()) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Label and URL are required", 400);
      }

      if (!req.file) {
        return errorResponse(res, "Button image is required", 400);
      }

      const count = await FooterLink.countDocuments();

      const link = await FooterLink.create({
        label: label.trim(),
        url: url.trim(),
        image: `/uploads/${req.file.filename}`,
        openInNewTab: openInNewTab === "true" || openInNewTab === true,
        order: count,
      });

      return successResponse(res, "Footer link created", { link }, 201);
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/footer-links/:id",
  handleUpload(upload.single("image")),
  async (req, res) => {
    try {
      const link = await FooterLink.findById(req.params.id);

      if (!link) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Footer link not found", 404);
      }

      const { label, url, openInNewTab } = req.body || {};
      const previousImage = link.image;

      if (label?.trim()) link.label = label.trim();
      if (url?.trim()) link.url = url.trim();
      if (typeof openInNewTab !== "undefined") {
        link.openInNewTab = openInNewTab === "true" || openInNewTab === true;
      }
      if (req.file) link.image = `/uploads/${req.file.filename}`;

      await link.save();

      if (req.file && previousImage) deleteLocalFile(previousImage);

      return successResponse(res, "Footer link updated", { link });
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete("/footer-links/:id", async (req, res) => {
  try {
    const link = await FooterLink.findByIdAndDelete(req.params.id);

    if (!link) return errorResponse(res, "Footer link not found", 404);

    deleteLocalFile(link.image);

    return successResponse(res, "Footer link deleted");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Home Page Sections (title + optional background)
========================= */
router.get("/home-sections", async (req, res) => {
  try {
    const sections = await Promise.all(HOME_SECTION_KEYS.map(ensureHomeSection));
    return successResponse(res, "Home sections loaded", { sections });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.get("/home-sections/:key", async (req, res) => {
  try {
    const { key } = req.params;

    if (!HOME_SECTION_KEYS.includes(key)) {
      return errorResponse(res, "Invalid section key", 400);
    }

    const section = await ensureHomeSection(key);

    return successResponse(res, "Home section loaded", {
      section,
      supportsBackground: SECTIONS_WITH_BACKGROUND.includes(key),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/home-sections/:key",
  handleUpload(
    upload.fields([
      { name: "backgroundDesktop", maxCount: 1 },
      { name: "backgroundMobile", maxCount: 1 },
    ]),
  ),
  async (req, res) => {
    const files = req.files || {};
    const desktopFile = files.backgroundDesktop?.[0];
    const mobileFile = files.backgroundMobile?.[0];

    try {
      const { key } = req.params;

      if (!HOME_SECTION_KEYS.includes(key)) {
        if (desktopFile) deleteLocalFile(`/uploads/${desktopFile.filename}`);
        if (mobileFile) deleteLocalFile(`/uploads/${mobileFile.filename}`);
        return errorResponse(res, "Invalid section key", 400);
      }

      const supportsBackground = SECTIONS_WITH_BACKGROUND.includes(key);

      if ((desktopFile || mobileFile) && !supportsBackground) {
        if (desktopFile) deleteLocalFile(`/uploads/${desktopFile.filename}`);
        if (mobileFile) deleteLocalFile(`/uploads/${mobileFile.filename}`);
        return errorResponse(res, "This section has no background image", 400);
      }

      const { title } = req.body || {};

      if (!title?.trim()) {
        if (desktopFile) deleteLocalFile(`/uploads/${desktopFile.filename}`);
        if (mobileFile) deleteLocalFile(`/uploads/${mobileFile.filename}`);
        return errorResponse(res, "Title is required", 400);
      }

      const section = await ensureHomeSection(key);
      const previousDesktop = section.backgroundDesktop;
      const previousMobile = section.backgroundMobile;

      section.title = title.trim();
      if (desktopFile) section.backgroundDesktop = `/uploads/${desktopFile.filename}`;
      if (mobileFile) section.backgroundMobile = `/uploads/${mobileFile.filename}`;

      await section.save();

      if (desktopFile && previousDesktop) deleteLocalFile(previousDesktop);
      if (mobileFile && previousMobile) deleteLocalFile(previousMobile);

      return successResponse(res, "Home section updated", { section });
    } catch (error) {
      if (desktopFile) deleteLocalFile(`/uploads/${desktopFile.filename}`);
      if (mobileFile) deleteLocalFile(`/uploads/${mobileFile.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   Favorite Hero Slides (upload-only image list)
========================= */
router.get("/hero-slides", async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 });
    return successResponse(res, "Hero slides loaded", { slides });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/hero-slides",
  handleUpload(upload.single("image")),
  async (req, res) => {
    try {
      if (!req.file) {
        return errorResponse(res, "Hero image is required", 400);
      }

      const { name } = req.body || {};
      const count = await HeroSlide.countDocuments();

      const slide = await HeroSlide.create({
        name: name?.trim() || "",
        image: `/uploads/${req.file.filename}`,
        order: count,
      });

      return successResponse(res, "Hero slide created", { slide }, 201);
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/hero-slides/:id",
  handleUpload(upload.single("image")),
  async (req, res) => {
    try {
      const slide = await HeroSlide.findById(req.params.id);

      if (!slide) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Hero slide not found", 404);
      }

      const { name } = req.body || {};
      const previousImage = slide.image;

      if (typeof name === "string") slide.name = name.trim();
      if (req.file) slide.image = `/uploads/${req.file.filename}`;

      await slide.save();

      if (req.file && previousImage) deleteLocalFile(previousImage);

      return successResponse(res, "Hero slide updated", { slide });
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete("/hero-slides/:id", async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);

    if (!slide) return errorResponse(res, "Hero slide not found", 404);

    deleteLocalFile(slide.image);

    return successResponse(res, "Hero slide deleted");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Live TV — external source lookup + managed channel list
========================= */
router.get("/live-tv-source", async (req, res) => {
  try {
    const { channels, stale } = await loadLiveTvSourceChannels();

    return successResponse(
      res,
      stale
        ? "Channel source list loaded from cache — the source is unreachable right now"
        : "Channel source list loaded",
      { channels, stale },
    );
  } catch (error) {
    return errorResponse(res, error.message, 502);
  }
});

router.get("/live-tv-channels", async (req, res) => {
  try {
    const channels = await LiveTvChannel.find().sort({ order: 1, createdAt: 1 });
    // Sent alongside the channels so the admin form's category dropdown is
    // always in step with the sections the client actually renders.
    return successResponse(res, "Live TV channels loaded", {
      channels,
      categories: LIVE_TV_CATEGORIES,
      listLimit: LIVE_TV_LIST_LIMIT,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/live-tv-channels",
  handleUpload(upload.single("logo")),
  async (req, res) => {
    try {
      const { name, streamUrl, homeFeatured, categories, pinned, showOnList } =
        req.body || {};

      if (!name?.trim() || !streamUrl?.trim()) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Name and stream URL are required", 400);
      }

      const parsedCategories = parseLiveTvCategories(categories);

      if (!parsedCategories?.length) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Choose at least one category for this channel", 400);
      }

      if (!req.file) {
        return errorResponse(res, "A logo image is required", 400);
      }

      const onList = showOnList === "true" || showOnList === true;

      if (onList) {
        const full = await findFullListCategory(parsedCategories);
        if (full) {
          deleteLocalFile(`/uploads/${req.file.filename}`);
          return errorResponse(
            res,
            `"${full}" already shows ${LIVE_TV_LIST_LIMIT} channels on the Live TV page — remove one first.`,
            400,
          );
        }
      }

      const count = await LiveTvChannel.countDocuments();

      const channel = await LiveTvChannel.create({
        name: name.trim(),
        streamUrl: streamUrl.trim(),
        logo: `/uploads/${req.file.filename}`,
        homeFeatured: homeFeatured === "true" || homeFeatured === true,
        categories: parsedCategories,
        showOnList: onList,
        pinned: pinned === "true" || pinned === true,
        order: count,
      });

      return successResponse(res, "Live TV channel created", { channel }, 201);
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/live-tv-channels/:id",
  handleUpload(upload.single("logo")),
  async (req, res) => {
    try {
      const channel = await LiveTvChannel.findById(req.params.id);

      if (!channel) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Live TV channel not found", 404);
      }

      const { name, streamUrl, homeFeatured, categories, pinned, showOnList } =
        req.body || {};
      const previousLogo = channel.logo;

      const parsedCategories = parseLiveTvCategories(categories);

      if (typeof categories !== "undefined" && !parsedCategories?.length) {
        if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
        return errorResponse(res, "Choose at least one category for this channel", 400);
      }

      const onList =
        typeof showOnList === "undefined"
          ? channel.showOnList
          : showOnList === "true" || showOnList === true;

      if (onList) {
        const full = await findFullListCategory(
          parsedCategories || channel.categories,
          { externalId: channel._id },
        );
        if (full) {
          if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
          return errorResponse(
            res,
            `"${full}" already shows ${LIVE_TV_LIST_LIMIT} channels on the Live TV page — remove one first.`,
            400,
          );
        }
      }

      channel.showOnList = onList;

      if (name?.trim()) channel.name = name.trim();
      if (streamUrl?.trim()) channel.streamUrl = streamUrl.trim();
      if (typeof homeFeatured !== "undefined") {
        channel.homeFeatured = homeFeatured === "true" || homeFeatured === true;
      }
      if (parsedCategories) channel.categories = parsedCategories;
      if (typeof pinned !== "undefined") {
        channel.pinned = pinned === "true" || pinned === true;
      }
      if (req.file) channel.logo = `/uploads/${req.file.filename}`;

      await channel.save();

      if (req.file && previousLogo) deleteLocalFile(previousLogo);

      return successResponse(res, "Live TV channel updated", { channel });
    } catch (error) {
      if (req.file) deleteLocalFile(`/uploads/${req.file.filename}`);
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete("/live-tv-channels/:id", async (req, res) => {
  try {
    const channel = await LiveTvChannel.findByIdAndDelete(req.params.id);

    if (!channel) return errorResponse(res, "Live TV channel not found", 404);

    deleteLocalFile(channel.logo);

    return successResponse(res, "Live TV channel deleted");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
