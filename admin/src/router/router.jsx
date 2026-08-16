import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import CreateAdmin from "../pages/CreateAdmin/CreateAdmin";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

import AllUsers from "../pages/AllUsers/AllUsers";
import UserDetails from "../pages/UserDetails/UserDetails";

import Videos from "../pages/Videos/Videos";
import VideoDetails from "../pages/VideoDetails/VideoDetails";
import UploadVideo from "../pages/UploadVideo/UploadVideo";
import PromotionRequests from "../pages/PromotionRequests/PromotionRequests";
import AdCampaigns from "../pages/AdCampaigns/AdCampaigns";
import SiteAnalytics from "../pages/SiteAnalytics/SiteAnalytics";

import ContentHollywood from "../pages/ContentHollywood/ContentHollywood";
import ContentHorror from "../pages/ContentHorror/ContentHorror";
import ContentLiveTv from "../pages/ContentLiveTv/ContentLiveTv";
import OTv from "../pages/OTv/OTv";
import ContentFootball from "../pages/ContentFootball/ContentFootball";
import ContentTrending from "../pages/ContentTrending/ContentTrending";
import ContentTopTen from "../pages/ContentTopTen/ContentTopTen";
import ContentFreeMovie from "../pages/ContentFreeMovie/ContentFreeMovie";
import ContentAllChannel from "../pages/ContentAllChannel/ContentAllChannel";
import ContentAllOtt from "../pages/ContentAllOtt/ContentAllOtt";
import ContentFavoriteBanner from "../pages/ContentFavoriteBanner/ContentFavoriteBanner";

import SiteSliders from "../pages/SiteSliders/SiteSliders";
import SiteAds from "../pages/SiteAds/SiteAds";
import SiteFooterSetting from "../pages/SiteFooterSetting/SiteFooterSetting";
import SiteIdentify from "../pages/SiteIdentify/SiteIdentify";

import PrivateVideoPlaylist from "../pages/PrivateVideoPlaylist/PrivateVideoPlaylist";
import PrivateVideo from "../pages/PrivateVideo/PrivateVideo";
import PrivatePlaylistVideos from "../pages/PrivatePlaylistVideos/PrivatePlaylistVideos";
import PrivateUser from "../pages/PrivateUser/PrivateUser";

const wrap = (permKey, Component) => (
  <PrivateRoute permKey={permKey}>
    <Component />
  </PrivateRoute>
);

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "create-admin",
        element: (
          <PrivateRoute motherOnly>
            <CreateAdmin />
          </PrivateRoute>
        ),
      },

      { path: "all-users", element: wrap("all-users", AllUsers) },
      {
        path: "all-users/:id",
        element: wrap("all-users", UserDetails),
      },

      { path: "videos", element: wrap("videos", Videos) },
      { path: "videos/:id", element: wrap("videos", VideoDetails) },
      { path: "upload-video", element: wrap("upload-video", UploadVideo) },
      {
        path: "promotion-requests",
        element: wrap("promotion-requests", PromotionRequests),
      },
      {
        path: "ad-campaigns",
        element: wrap("ad-campaigns", AdCampaigns),
      },
      {
        path: "site-analytics",
        element: wrap("site-analytics", SiteAnalytics),
      },
      {
        path: "o-tv",
        element: wrap("o-tv", OTv),
      },

      {
        path: "content/hollywood",
        element: wrap("content-hollywood", ContentHollywood),
      },
      {
        path: "content/horror",
        element: wrap("content-horror", ContentHorror),
      },
      {
        path: "content/live-tv",
        element: wrap("content-live-tv", ContentLiveTv),
      },
      {
        path: "content/football",
        element: wrap("content-football", ContentFootball),
      },
      {
        path: "content/trending",
        element: wrap("content-trending", ContentTrending),
      },
      {
        path: "content/top-ten",
        element: wrap("content-top-ten", ContentTopTen),
      },
      {
        path: "content/free-movie",
        element: wrap("content-free-movie", ContentFreeMovie),
      },
      {
        path: "content/all-channel",
        element: wrap("content-all-channel", ContentAllChannel),
      },
      {
        path: "content/all-ott",
        element: wrap("content-all-ott", ContentAllOtt),
      },
      {
        path: "content/favorite-banner",
        element: wrap("content-favorite-banner", ContentFavoriteBanner),
      },

      { path: "site/sliders", element: wrap("site-sliders", SiteSliders) },
      { path: "site/ads", element: wrap("site-ads", SiteAds) },
      {
        path: "site/footer-setting",
        element: wrap("site-footer-setting", SiteFooterSetting),
      },
      {
        path: "site/site-identify",
        element: wrap("site-identify", SiteIdentify),
      },

      {
        path: "private-video-playlist",
        element: wrap("private-video-playlist", PrivateVideoPlaylist),
      },
      {
        path: "private-video",
        element: wrap("private-video", PrivateVideo),
      },
      {
        path: "private-playlist-videos",
        element: wrap("private-playlist-videos", PrivatePlaylistVideos),
      },
      {
        path: "private-user",
        element: wrap("private-user", PrivateUser),
      },
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
