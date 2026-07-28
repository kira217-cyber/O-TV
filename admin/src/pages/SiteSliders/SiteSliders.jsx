import React from "react";
import { Layers } from "lucide-react";

import PromotedVideosPanel from "../../components/PromotedVideosPanel/PromotedVideosPanel";

const SiteSliders = () => {
  return (
    <div className="mx-auto max-w-7xl text-white">
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-4 py-3">
          <Layers className="h-5 w-5 text-[#8b5cf6]" />
          <span className="text-sm font-bold text-violet-200">Home Page Slider</span>
        </div>

        <h1 className="mt-4 bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
          Slider Control
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          The rotating hero banner at the very top of the home page shows
          whichever videos are promoted here — approve requests from the{" "}
          Promotion Requests page, or promote a video directly from the
          Upload Video page.
        </p>
      </div>

      <PromotedVideosPanel sectionKey="slider" />
    </div>
  );
};

export default SiteSliders;
