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

// The exact on-screen size each position renders at on the client player —
// kept in sync with SECTION_POSITION_CLASSES in
// client/src/components/AdOverlay/AdOverlay.jsx. Shown to the admin so they
// know what size image to upload for each spot.
export const IMAGE_AD_SECTION_SIZES = {
  topLeft: { desktop: "200 × 280px", mobile: "110 × 150px" },
  topRight: { desktop: "180 × 110px", mobile: "100 × 60px" },
  bottomRight: { desktop: "180 × 110px", mobile: "100 × 60px" },
  bottomBanner: { desktop: "640 × 70px (full width)", mobile: "340 × 40px (full width)" },
};
