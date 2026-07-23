import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import CreateAdmin from "../pages/CreateAdmin/CreateAdmin";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

import AllUsers from "../pages/AllUsers/AllUsers";

import DepositMethods from "../pages/DepositMethods/DepositMethods";
import DepositRequests from "../pages/DepositRequests/DepositRequests";

import WithdrawMethods from "../pages/WithdrawMethods/WithdrawMethods";
import WithdrawRequests from "../pages/WithdrawRequests/WithdrawRequests";

import ContentHollywood from "../pages/ContentHollywood/ContentHollywood";
import ContentHorror from "../pages/ContentHorror/ContentHorror";
import ContentLiveTv from "../pages/ContentLiveTv/ContentLiveTv";
import ContentFootball from "../pages/ContentFootball/ContentFootball";
import ContentTrending from "../pages/ContentTrending/ContentTrending";
import ContentTopTen from "../pages/ContentTopTen/ContentTopTen";
import ContentFreeMovie from "../pages/ContentFreeMovie/ContentFreeMovie";
import ContentAllChannel from "../pages/ContentAllChannel/ContentAllChannel";
import ContentAllOtt from "../pages/ContentAllOtt/ContentAllOtt";
import ContentFavoriteBanner from "../pages/ContentFavoriteBanner/ContentFavoriteBanner";

import SiteSliders from "../pages/SiteSliders/SiteSliders";
import SiteNotices from "../pages/SiteNotices/SiteNotices";
import SiteAds from "../pages/SiteAds/SiteAds";
import SiteFooterSetting from "../pages/SiteFooterSetting/SiteFooterSetting";
import SiteSocialLink from "../pages/SiteSocialLink/SiteSocialLink";
import SiteWhyUs from "../pages/SiteWhyUs/SiteWhyUs";
import SiteIdentify from "../pages/SiteIdentify/SiteIdentify";

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
        path: "deposit-methods",
        element: wrap("deposit-methods", DepositMethods),
      },
      {
        path: "deposit-requests",
        element: wrap("deposit-requests", DepositRequests),
      },

      {
        path: "withdraw-methods",
        element: wrap("withdraw-methods", WithdrawMethods),
      },
      {
        path: "withdraw-requests",
        element: wrap("withdraw-requests", WithdrawRequests),
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
      { path: "site/notices", element: wrap("site-notices", SiteNotices) },
      { path: "site/ads", element: wrap("site-ads", SiteAds) },
      {
        path: "site/footer-setting",
        element: wrap("site-footer-setting", SiteFooterSetting),
      },
      {
        path: "site/social-link",
        element: wrap("site-social-link", SiteSocialLink),
      },
      { path: "site/why-us", element: wrap("site-why-us", SiteWhyUs) },
      {
        path: "site/site-identify",
        element: wrap("site-identify", SiteIdentify),
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
