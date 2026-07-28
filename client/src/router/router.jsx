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
