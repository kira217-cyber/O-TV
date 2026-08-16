import React, { useEffect } from "react";
import { Navigate } from "react-router";
import Home from "./Home";

// Landing at "/" — desktop gets the regular home page, mobile gets sent
// straight to Live TV instead (that's the primary mobile experience this
// site is built around; matches the same md: breakpoint used everywhere
// else in the app for mobile/desktop layout switches, e.g. BottomNavbar).
//
// This must only redirect on the very first arrival at the site this
// session, never on a later visit to "/" (e.g. tapping the Home item in
// the bottom nav) — otherwise mobile users could never reach Home at
// all, since every return to "/" would just bounce them back to Live TV.
//
// `hasEnteredSite` is module state, not component state, so it survives
// client-side route changes and only resets on an actual page reload —
// exactly when "entering the site" should be re-evaluated. It's only
// ever WRITTEN inside the effect below (after render commits), never
// during the render body itself: StrictMode intentionally renders this
// component twice on mount to catch impure renders, and mutating the
// flag directly in the render body would make the two calls disagree
// (first call sees it unset and redirects, second sees it already set
// and doesn't) — reading it as a plain, un-mutated value during render
// keeps both calls consistent.
let hasEnteredSite = false;

const isMobileViewport = () =>
  typeof window !== "undefined" && window.innerWidth < 768;

const HomeEntry = () => {
  const isFirstEntry = !hasEnteredSite;

  useEffect(() => {
    hasEnteredSite = true;
  }, []);

  if (isFirstEntry && isMobileViewport()) {
    return <Navigate to="/live-tv" replace />;
  }

  return <Home />;
};

export default HomeEntry;
