// Video targeting and Live TV targeting are independent toggles — a
// campaign always applies to both, each at "all" or one "single" item, so
// e.g. "All Live TV" + "one specific video" can be combined freely.
export const TARGET_SCOPES = [
  { key: "all", label: "All" },
  { key: "single", label: "Single" },
];

export const IMAGE_AD_SECTIONS = [
  { key: "topLeft", label: "Top Left" },
  { key: "topRight", label: "Top Right" },
  { key: "bottomRight", label: "Bottom Right" },
  { key: "bottomBanner", label: "Bottom Banner" },
];

// Default drag position (percentage of the frame) for each section — kept
// in sync with IMAGE_AD_DEFAULT_POSITIONS in server/models/AdCampaign.js.
export const IMAGE_AD_DEFAULT_POSITIONS = {
  topLeft: { x: 2, y: 4 },
  topRight: { x: 78, y: 4 },
  bottomRight: { x: 78, y: 22 },
  bottomBanner: { x: 0, y: 85 },
};

// Default drag SIZE (percentage of the frame's own width/height) for each
// section — admin can resize freely from here. Kept in sync with
// IMAGE_AD_DEFAULT_SIZES in server/models/AdCampaign.js. Since both the
// mockup preview here and the real client frame
// (client/src/components/AdOverlay/AdOverlay.jsx) are percentage-sized
// against the same aspect-video shape, a section always renders at the
// exact same proportion in both places, at any real player width.
export const IMAGE_AD_DEFAULT_SIZES = {
  topLeft: { width: 20.83, height: 51.85 },
  topRight: { width: 18.75, height: 20.37 },
  bottomRight: { width: 18.75, height: 20.37 },
  bottomBanner: { width: 100, height: 12.96 },
};

// Floor so a section can never be resized down to an invisible sliver.
export const MIN_SECTION_SIZE_PERCENT = 3;
