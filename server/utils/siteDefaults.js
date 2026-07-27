import HomeSection from "../models/HomeSection.js";
import AdsSetting from "../models/AdsSetting.js";

// The current hardcoded content, used to seed each fixed-key document the
// first time it's read — so nothing on the live site changes until an
// admin actually edits it here.
export const HOME_SECTION_DEFAULTS = {
  trending: { title: "Trending" },
  freeMovie: {
    title: "Shakib Khan's Free Movie",
    backgroundDesktop:
      "https://asset.bioscopelive.com/uploads/images/2026/05/11/thumbnail_backgrounds_28a3a697b1aeef449bb7e55cc1b8192b_goplay_king_of_d_8.png",
    backgroundMobile:
      "https://asset.bioscopelive.com/uploads/images/2026/05/12/poster_backgrounds_76bd705d7bfc7c6cce5d6f67db691a01_goplay_enjoy_f_for_phone_2.png?w=1920&q=75",
  },
  topTen: { title: "Top 10 Movies" },
  allOtt: { title: "All OTT Platforms" },
  allChannel: { title: "Unlimited Entertainment" },
  football: {
    title: "FIFA Rewind",
    backgroundDesktop:
      "https://asset.bioscopelive.com/uploads/images/2026/07/21/thumbnail_backgrounds_1bc44929b7ec290e1187d9be8a6bf8af_goplay_upcoming_web.png?w=1920&q=75",
    backgroundMobile:
      "https://asset.bioscopelive.com/uploads/images/2026/07/21/poster_backgrounds_0e87771687f96ed877d7af0ecca769fc_goplay_fifa_phone.png?w=1920&q=75",
  },
  liveTv: { title: "Live TV" },
  hollywood: {
    title: "Hollywood Blockbuster Legends",
    backgroundDesktop:
      "https://asset.bioscopelive.com/uploads/images/2026/02/02/thumbnail_backgrounds_2ecce0eec8885a0d9356ccf210c01107_goplay_hollywood_drop.png?w=1920&q=75",
    backgroundMobile:
      "https://asset.bioscopelive.com/uploads/images/2026/04/12/poster_backgrounds_d509fea351217249170da515fa1008ab_goplay_hollywood_phone.png?w=1920&q=75",
  },
  favoriteHero: { title: "Pick Your Favorite Hero" },
  horror: { title: "Horror" },
};

export const ensureHomeSection = async (key) => {
  let section = await HomeSection.findOne({ key });

  if (!section) {
    const seed = HOME_SECTION_DEFAULTS[key] || { title: key };
    section = await HomeSection.create({ key, ...seed });
  }

  return section;
};

export const ensureAdsSlot = async (slot) => {
  let ads = await AdsSetting.findOne({ slot });

  if (!ads) {
    ads = await AdsSetting.create({ slot });
  }

  return ads;
};
