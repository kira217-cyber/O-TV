import React from "react";
import HomeSectionEditor from "../../components/HomeSectionEditor/HomeSectionEditor";
import LiveTvManager from "../../components/LiveTvManager/LiveTvManager";

const ContentLiveTv = () => (
  <>
    <HomeSectionEditor sectionKey="liveTv" pageTitle="Live TV Section" />
    <LiveTvManager />
  </>
);

export default ContentLiveTv;
