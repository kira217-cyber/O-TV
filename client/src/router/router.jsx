import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import HomeEntry from "../pages/Home/HomeEntry";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Withdraw from "../pages/Withdraw/Withdraw";
import Deposit from "../pages/Deposit/Deposit";
import WatchVideo from "../pages/WatchVideo/WatchVideo";
import ChannelPage from "../pages/ChannelPage/ChannelPage";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import CreatorChannels from "../pages/CreatorChannels/CreatorChannels";
import LiveTvPage from "../pages/LiveTvPage/LiveTvPage";
import LiveTvWatch from "../pages/LiveTvWatch/LiveTvWatch";
import Movies from "../pages/Movies/Movies";
import Natok from "../pages/Natok/Natok";
import Sports from "../pages/Sports/Sports";
import SearchResults from "../pages/SearchResults/SearchResults";
import Shorts from "../pages/Shorts/Shorts";
import New from "../pages/New/New";
import TermsOfUse from "../pages/TermsOfUse/TermsOfUse";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";
import Faq from "../pages/Faq/Faq";
import Feedback from "../pages/Feedback/Feedback";
import ContactUs from "../pages/ContactUs/ContactUs";
import PrivateUserLogin from "../pages/PrivateUserLogin/PrivateUserLogin";
import PrivateVideo from "../pages/PrivateVideo/PrivateVideo";
import PrivateUserRoute from "../PrivateUserRoute/PrivateUserRoute";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomeEntry />,
      },
      {
        path: "watch/:id",
        element: <WatchVideo />,
      },
      {
        path: "channel/:id",
        element: <ChannelPage />,
      },
      {
        path: "creator-channels",
        element: <CreatorChannels />,
      },
      {
        path: "live-tv",
        element: <LiveTvPage />,
      },
      {
        path: "live-tv/:id",
        element: <LiveTvWatch />,
      },
      {
        path: "movies",
        element: <Movies />,
      },
      {
        path: "natok",
        element: <Natok />,
      },
      {
        path: "sports",
        element: <Sports />,
      },
      {
        path: "search",
        element: <SearchResults />,
      },
      {
        path: "shorts",
        element: <Shorts />,
      },
      {
        path: "new",
        element: <New />,
      },
      {
        path: "terms-of-use",
        element: <TermsOfUse />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "faq",
        element: <Faq />,
      },
      {
        path: "feedback",
        element: <Feedback />,
      },
      {
        path: "contact-us",
        element: <ContactUs />,
      },
      {
        path: "withdraw",
        element: (
          <PrivateRoute>
            {" "}
            <Withdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit",
        element: (
          <PrivateRoute>
            <Deposit />
          </PrivateRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "private-user-login",
        element: <PrivateUserLogin />,
      },
      {
        path: "private-video",
        element: (
          <PrivateUserRoute>
            <PrivateVideo />
          </PrivateUserRoute>
        ),
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
