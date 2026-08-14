import express from "express";

import AdCampaign, {
  TARGET_SCOPES,
  IMAGE_AD_SECTIONS,
  IMAGE_AD_DEFAULT_POSITIONS,
  IMAGE_AD_DEFAULT_SIZES,
  MIN_SECTION_SIZE_PERCENT,
} from "../models/AdCampaign.js";
import Video from "../models/Video.js";
import LiveTvChannel from "../models/LiveTvChannel.js";

import { uploadAdFields } from "../config/multerAds.js";
import { handleUpload } from "../utils/handleUpload.js";
import { uploadToBunny, deleteFromBunny } from "../config/bunnyStorage.js";
import {
  saveThumbnail,
  deleteLocalFile,
  buildBunnyFileName,
} from "../utils/videoFiles.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

router.use(protectAdmin);

const SECTION_FIELD_MAP = {
  topLeft: "topLeftImage",
  topRight: "topRightImage",
  bottomRight: "bottomRightImage",
  bottomBanner: "bottomBannerImage",
};

// Percentage value — clamps to [min, max] and falls back to a default
// when the request didn't send a usable number.
const clampPercent = (value, fallback, min = 0, max = 100) => {
  const num = parseFloat(value);
  const resolved = Number.isFinite(num) ? num : fallback;
  return Math.min(max, Math.max(min, resolved));
};

// Both size and position are admin-draggable now (resize handle + move),
// so a section can never be saved such that it extends past the frame —
// size is resolved first, then position is clamped against `100 - size`
// for that axis. Mirrors the equivalent logic in
// admin/src/components/AdCampaignManager/AdCampaignManager.jsx's drag
// handlers. bottomBanner's width/positionX are always locked (100/0) —
// it's always full-frame width, only its height and vertical position
// are adjustable.
const resolveSectionGeometry = (section, body, existing) => {
  const fallbackPos = IMAGE_AD_DEFAULT_POSITIONS[section];
  const fallbackSize = IMAGE_AD_DEFAULT_SIZES[section];
  const hasExistingImage = Boolean(existing?.image);

  const fallbackWidth =
    hasExistingImage && existing?.width ? existing.width : fallbackSize.width;
  const fallbackHeight =
    hasExistingImage && existing?.height ? existing.height : fallbackSize.height;

  const width =
    section === "bottomBanner"
      ? 100
      : clampPercent(body?.[`${section}Width`], fallbackWidth, MIN_SECTION_SIZE_PERCENT, 100);
  const height = clampPercent(
    body?.[`${section}Height`],
    fallbackHeight,
    MIN_SECTION_SIZE_PERCENT,
    100,
  );

  // An empty slot's stored position is just an unused schema default
  // (0/0), not a real placement — fall back to the sensible corner
  // default instead so a freshly-filled slot doesn't land at 0,0.
  const fallbackX = hasExistingImage ? existing?.positionX ?? fallbackPos.x : fallbackPos.x;
  const fallbackY = hasExistingImage ? existing?.positionY ?? fallbackPos.y : fallbackPos.y;

  const positionX =
    section === "bottomBanner"
      ? 0
      : clampPercent(body?.[`${section}PositionX`], fallbackX, 0, 100 - width);
  const positionY = clampPercent(body?.[`${section}PositionY`], fallbackY, 0, 100 - height);

  return { width, height, positionX, positionY };
};

// Video targeting and Live TV targeting are independent toggles — resolves
// one of them ("all" needs no id, "single" needs a valid existing doc id).
const resolveSingleTarget = async (scope, id, Model, label) => {
  if (scope !== "single") return { value: null };
  if (!id) return { error: `A ${label} must be selected for this target` };

  const doc = await Model.findById(id);
  if (!doc) return { error: `Selected ${label} not found` };

  return { value: doc._id };
};

/* =========================
   List Ad Campaigns
========================= */
router.get("/", async (req, res) => {
  try {
    const campaigns = await AdCampaign.find()
      .sort({ createdAt: -1 })
      .populate("targetVideo", "title")
      .populate("targetLiveTvChannel", "name");

    return successResponse(res, "Ad campaigns loaded", { campaigns });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Create Ad Campaign
========================= */
router.post("/", handleUpload(uploadAdFields), async (req, res) => {
  const files = req.files || {};

  const rollbackActions = [];
  const rollback = async () => {
    for (const action of rollbackActions.reverse()) {
      await action().catch(() => {});
    }
  };

  try {
    const {
      title,
      type,
      skipAfterSeconds,
      clickUrl,
      displayDurationSeconds,
      firstDelaySeconds,
      intervalSeconds,
      videoScope,
      targetVideo,
      liveTvScope,
      targetLiveTvChannel,
      scheduleType,
      endDate,
      enabled,
    } = req.body || {};

    if (!title?.trim()) {
      return errorResponse(res, "Title is required", 400);
    }

    if (type !== "video" && type !== "image") {
      return errorResponse(res, "Type must be 'video' or 'image'", 400);
    }

    const normalizedVideoScope = TARGET_SCOPES.includes(videoScope) ? videoScope : "all";
    const normalizedLiveTvScope = TARGET_SCOPES.includes(liveTvScope)
      ? liveTvScope
      : "all";

    const videoTarget = await resolveSingleTarget(
      normalizedVideoScope,
      targetVideo,
      Video,
      "video",
    );
    if (videoTarget.error) return errorResponse(res, videoTarget.error, 400);

    const liveTvTarget = await resolveSingleTarget(
      normalizedLiveTvScope,
      targetLiveTvChannel,
      LiveTvChannel,
      "Live TV channel",
    );
    if (liveTvTarget.error) return errorResponse(res, liveTvTarget.error, 400);

    const normalizedScheduleType =
      scheduleType === "lifetime" ? "lifetime" : "campaign";

    if (
      normalizedScheduleType === "campaign" &&
      (!endDate || Number.isNaN(new Date(endDate).getTime()))
    ) {
      return errorResponse(
        res,
        "A valid end date is required for a campaign schedule",
        400,
      );
    }

    const payload = {
      title: title.trim(),
      type,
      videoScope: normalizedVideoScope,
      targetVideo: videoTarget.value,
      liveTvScope: normalizedLiveTvScope,
      targetLiveTvChannel: liveTvTarget.value,
      scheduleType: normalizedScheduleType,
      startDate: new Date(),
      endDate: normalizedScheduleType === "lifetime" ? null : new Date(endDate),
      enabled: enabled !== "false" && enabled !== false,
      firstDelaySeconds: Math.max(0, parseInt(firstDelaySeconds, 10) || 30),
      intervalSeconds: Math.max(1, parseInt(intervalSeconds, 10) || 120),
    };

    if (type === "video") {
      const videoFile = files.adVideo?.[0];

      if (!videoFile) {
        return errorResponse(res, "An ad video file is required", 400);
      }

      const videoFileName = buildBunnyFileName("ad-video", videoFile.originalname);
      const videoUrl = await uploadToBunny(
        videoFile.buffer,
        videoFileName,
        videoFile.mimetype,
      );
      rollbackActions.push(async () => deleteFromBunny(videoFileName));

      payload.video = { url: videoUrl, fileName: videoFileName };
      payload.skipAfterSeconds = Math.max(0, parseInt(skipAfterSeconds, 10) || 5);
      payload.clickUrl = clickUrl?.trim() || null;
    } else {
      const imageSections = {};
      let hasAnySection = false;

      for (const section of IMAGE_AD_SECTIONS) {
        const field = SECTION_FIELD_MAP[section];
        const file = files[field]?.[0];
        const urlValue = req.body?.[`${section}Url`];

        if (file) {
          const imagePath = await saveThumbnail(file);
          rollbackActions.push(async () => deleteLocalFile(imagePath));
          const { width, height, positionX, positionY } = resolveSectionGeometry(
            section,
            req.body,
            null,
          );
          imageSections[section] = {
            image: imagePath,
            url: urlValue?.trim() || null,
            positionX,
            positionY,
            width,
            height,
          };
          hasAnySection = true;
        }
      }

      if (!hasAnySection) {
        return errorResponse(res, "At least one image section is required", 400);
      }

      payload.imageSections = imageSections;
      payload.displayDurationSeconds = Math.max(
        1,
        parseInt(displayDurationSeconds, 10) || 10,
      );
    }

    const campaign = await AdCampaign.create(payload);

    return successResponse(res, "Ad campaign created", { campaign }, 201);
  } catch (error) {
    await rollback();
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Update Ad Campaign
========================= */
router.put("/:id", handleUpload(uploadAdFields), async (req, res) => {
  const files = req.files || {};

  const rollbackActions = [];
  const rollback = async () => {
    for (const action of rollbackActions.reverse()) {
      await action().catch(() => {});
    }
  };

  let oldVideoFileName = null;
  const oldSectionImages = {};

  try {
    const campaign = await AdCampaign.findById(req.params.id);

    if (!campaign) {
      return errorResponse(res, "Ad campaign not found", 404);
    }

    const {
      title,
      skipAfterSeconds,
      clickUrl,
      displayDurationSeconds,
      firstDelaySeconds,
      intervalSeconds,
      videoScope,
      targetVideo,
      liveTvScope,
      targetLiveTvChannel,
      scheduleType,
      endDate,
      enabled,
    } = req.body || {};

    if (title?.trim()) campaign.title = title.trim();

    if (typeof firstDelaySeconds !== "undefined") {
      campaign.firstDelaySeconds = Math.max(0, parseInt(firstDelaySeconds, 10) || 30);
    }

    if (typeof intervalSeconds !== "undefined") {
      campaign.intervalSeconds = Math.max(1, parseInt(intervalSeconds, 10) || 120);
    }

    if (typeof videoScope !== "undefined") {
      const scope = TARGET_SCOPES.includes(videoScope) ? videoScope : "all";
      const result = await resolveSingleTarget(scope, targetVideo, Video, "video");
      if (result.error) return errorResponse(res, result.error, 400);

      campaign.videoScope = scope;
      campaign.targetVideo = result.value;
    }

    if (typeof liveTvScope !== "undefined") {
      const scope = TARGET_SCOPES.includes(liveTvScope) ? liveTvScope : "all";
      const result = await resolveSingleTarget(
        scope,
        targetLiveTvChannel,
        LiveTvChannel,
        "Live TV channel",
      );
      if (result.error) return errorResponse(res, result.error, 400);

      campaign.liveTvScope = scope;
      campaign.targetLiveTvChannel = result.value;
    }

    if (scheduleType) {
      const normalizedScheduleType =
        scheduleType === "lifetime" ? "lifetime" : "campaign";

      if (
        normalizedScheduleType === "campaign" &&
        (!endDate || Number.isNaN(new Date(endDate).getTime()))
      ) {
        return errorResponse(
          res,
          "A valid end date is required for a campaign schedule",
          400,
        );
      }

      campaign.scheduleType = normalizedScheduleType;
      campaign.endDate =
        normalizedScheduleType === "lifetime" ? null : new Date(endDate);
    }

    if (typeof enabled !== "undefined") {
      campaign.enabled = enabled === "true" || enabled === true;
    }

    if (campaign.type === "video") {
      const videoFile = files.adVideo?.[0];

      if (videoFile) {
        const newVideoFileName = buildBunnyFileName(
          "ad-video",
          videoFile.originalname,
        );
        const newVideoUrl = await uploadToBunny(
          videoFile.buffer,
          newVideoFileName,
          videoFile.mimetype,
        );
        rollbackActions.push(async () => deleteFromBunny(newVideoFileName));
        oldVideoFileName = campaign.video?.fileName;
        campaign.video = { url: newVideoUrl, fileName: newVideoFileName };
      }

      if (typeof skipAfterSeconds !== "undefined") {
        campaign.skipAfterSeconds = Math.max(0, parseInt(skipAfterSeconds, 10) || 5);
      }

      if (typeof clickUrl !== "undefined") {
        campaign.clickUrl = clickUrl?.trim() || null;
      }
    } else {
      for (const section of IMAGE_AD_SECTIONS) {
        const field = SECTION_FIELD_MAP[section];
        const file = files[field]?.[0];
        const urlValue = req.body?.[`${section}Url`];
        const removeFlag = req.body?.[`${section}Remove`];
        const existing = campaign.imageSections?.[section];
        const { width, height, positionX, positionY } = resolveSectionGeometry(
          section,
          req.body,
          existing,
        );

        if (file) {
          const imagePath = await saveThumbnail(file);
          rollbackActions.push(async () => deleteLocalFile(imagePath));
          oldSectionImages[section] = existing?.image;
          campaign.imageSections[section] = {
            image: imagePath,
            url: typeof urlValue !== "undefined" ? urlValue?.trim() || null : existing?.url || null,
            positionX,
            positionY,
            width,
            height,
          };
        } else if (removeFlag === "true") {
          oldSectionImages[section] = existing?.image;
          campaign.imageSections[section] = {
            image: null,
            url: null,
            positionX,
            positionY,
            width,
            height,
          };
        } else if (
          typeof urlValue !== "undefined" ||
          typeof req.body?.[`${section}PositionX`] !== "undefined" ||
          typeof req.body?.[`${section}PositionY`] !== "undefined" ||
          typeof req.body?.[`${section}Width`] !== "undefined" ||
          typeof req.body?.[`${section}Height`] !== "undefined"
        ) {
          campaign.imageSections[section] = {
            image: existing?.image || null,
            url: typeof urlValue !== "undefined" ? urlValue?.trim() || null : existing?.url || null,
            positionX,
            positionY,
            width,
            height,
          };
        }
      }

      if (typeof displayDurationSeconds !== "undefined") {
        campaign.displayDurationSeconds = Math.max(
          1,
          parseInt(displayDurationSeconds, 10) || 10,
        );
      }
    }

    await campaign.save();

    if (oldVideoFileName) await deleteFromBunny(oldVideoFileName);

    for (const section of Object.keys(oldSectionImages)) {
      if (oldSectionImages[section]) deleteLocalFile(oldSectionImages[section]);
    }

    return successResponse(res, "Ad campaign updated", { campaign });
  } catch (error) {
    await rollback();
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Toggle Enabled
========================= */
router.patch("/:id/toggle", async (req, res) => {
  try {
    const campaign = await AdCampaign.findById(req.params.id);

    if (!campaign) {
      return errorResponse(res, "Ad campaign not found", 404);
    }

    campaign.enabled = !campaign.enabled;
    await campaign.save();

    return successResponse(
      res,
      campaign.enabled ? "Ad campaign enabled" : "Ad campaign disabled",
      { campaign },
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   Delete Ad Campaign
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const campaign = await AdCampaign.findByIdAndDelete(req.params.id);

    if (!campaign) {
      return errorResponse(res, "Ad campaign not found", 404);
    }

    if (campaign.video?.fileName) await deleteFromBunny(campaign.video.fileName);

    if (campaign.imageSections) {
      for (const section of IMAGE_AD_SECTIONS) {
        const image = campaign.imageSections[section]?.image;
        if (image) deleteLocalFile(image);
      }
    }

    return successResponse(res, "Ad campaign deleted");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
