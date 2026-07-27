// Mongoose auto-instantiates the nested `trailer` sub-schema (as
// { url: null, fileName: null }) even when no trailer was uploaded, so a
// presence check alone isn't enough — treat it as "no trailer" until a
// url has actually been saved (same gotcha as StudioUser.channel).
const normalizeTrailer = (trailer) => (trailer?.url ? trailer : null);

export const publicVideo = (video, { includeOwner = false } = {}) => {
  const base = {
    id: video._id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail,
    duration: video.duration,
    maturityRating: video.maturityRating,
    category: video.category,
    video: video.video,
    trailer: normalizeTrailer(video.trailer),
    status: video.status,
    rejectionReason: video.rejectionReason,
    views: video.views,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };

  if (includeOwner) {
    base.studioUser = video.studioUser?._id
      ? {
          id: video.studioUser._id,
          fullName: video.studioUser.fullName,
          email: video.studioUser.email,
          phone: video.studioUser.phone,
          channel: video.studioUser.channel?.name
            ? video.studioUser.channel
            : null,
        }
      : video.studioUser;
  } else {
    base.studioUser = video.studioUser?._id
      ? video.studioUser._id
      : video.studioUser;
  }

  return base;
};

export default publicVideo;
