import LiveTvChannel from "../models/LiveTvChannel.js";
import ScheduledLiveTvChannel from "../models/ScheduledLiveTvChannel.js";
import { LIVE_TV_CATEGORIES } from "../models/liveTvCategories.js";

// How many channels a single category may show directly in its row on the
// client's Live TV page. Anything beyond this lives behind that row's
// "View All" page, which lists the category in full.
export const LIVE_TV_LIST_LIMIT = 10;

const categoryLabel = (key) =>
  LIVE_TV_CATEGORIES.find((entry) => entry.key === key)?.label || key;

// Returns the label of the first category whose list is already full, or
// null when there's room in all of them. Counts across both the external
// channel collection and Pipra-TV, since they share the same rows on the
// client. `skip` leaves out the channel being edited so re-saving it
// doesn't count it against its own limit.
export const findFullListCategory = async (categoryKeys, skip = {}) => {
  for (const key of categoryKeys) {
    const externalFilter = { showOnList: true, categories: key };
    if (skip.externalId) externalFilter._id = { $ne: skip.externalId };

    const [externalCount, scheduledCount] = await Promise.all([
      LiveTvChannel.countDocuments(externalFilter),
      skip.scheduled
        ? Promise.resolve(0)
        : ScheduledLiveTvChannel.countDocuments({ showOnList: true, categories: key }),
    ]);

    if (externalCount + scheduledCount >= LIVE_TV_LIST_LIMIT) {
      return categoryLabel(key);
    }
  }

  return null;
};
