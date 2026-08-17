import React from "react";
import OTvManager from "../../components/OTvManager/OTvManager";

const OTv = () => (
  <div>
    <h1 className="text-2xl font-black text-white">Pipra-TV</h1>
    <p className="mt-1 text-sm text-slate-400">
      The site's own broadcast channel — set its identity, then upload the
      videos it plays and program its schedule.
    </p>
    <OTvManager />
  </div>
);

export default OTv;
