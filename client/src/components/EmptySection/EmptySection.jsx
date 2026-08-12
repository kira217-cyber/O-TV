import React from "react";
import { Inbox } from "lucide-react";

// Shown instead of a row/grid/banner when the database genuinely has no
// content for that section yet — replaces the old hardcoded demo/sample
// items that used to fill the gap.
const EmptySection = ({
  message = "No content added yet. Please add it from the admin panel.",
  className = "",
}) => (
  <div
    className={`flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center ${className}`}
  >
    <Inbox className="h-7 w-7 text-white/25" />
    <p className="text-sm font-medium text-white/40">{message}</p>
  </div>
);

export default EmptySection;
