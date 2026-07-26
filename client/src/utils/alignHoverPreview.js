/**
 * Desktop hover-preview cards (Trending, Free Movie, Hollywood, Horror,
 * All OTT Platforms, Football) are wider than the poster/thumbnail they
 * pop out from and are horizontally centered under it. Their slider
 * boundary clips overflow so extra slides don't peek past the section
 * edge — but that same clipping was cutting off the preview itself for
 * the first/last card in view (its Play/Share buttons ended up outside
 * the visible area). This nudges the preview back inside the boundary
 * on hover, only when it would otherwise overflow.
 */
export const alignHoverPreview = (
  event,
  boundarySelector,
  previewSelector,
  previewWidth,
  gap = 8,
) => {
  const card = event.currentTarget;
  const preview = card.querySelector(previewSelector);
  const boundary = card.closest(boundarySelector);

  if (!preview || !boundary) return;

  const cardRect = card.getBoundingClientRect();
  const boundaryRect = boundary.getBoundingClientRect();

  const centeredLeft = cardRect.left + cardRect.width / 2 - previewWidth / 2;

  const minLeft = boundaryRect.left + gap;
  const maxLeft = boundaryRect.right - previewWidth - gap;

  let clampedLeft = centeredLeft;
  if (clampedLeft < minLeft) clampedLeft = minLeft;
  if (clampedLeft > maxLeft) clampedLeft = maxLeft;

  const offset = clampedLeft - centeredLeft;

  preview.style.left = offset ? `calc(50% + ${offset}px)` : "";
};
