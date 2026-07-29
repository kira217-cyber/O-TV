import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
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

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
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
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
