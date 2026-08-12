import React from "react";

import AdCampaignManager from "../../components/AdCampaignManager/AdCampaignManager";

const AdCampaigns = () => (
  <div>
    <h1 className="text-2xl font-black text-white">Ad Campaigns</h1>
    <p className="mt-1 text-sm text-slate-400">
      In-player video and image ads that rotate over videos and Live TV
      channels while they play. Each campaign has its own rotation timing,
      so campaigns never compete for the same on-screen slot.
    </p>

    <AdCampaignManager />
  </div>
);

export default AdCampaigns;
