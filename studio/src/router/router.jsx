import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import MyChannel from "../pages/MyChannel/MyChannel";
import MyVideos from "../pages/MyVideos/MyVideos";
import UploadVideo from "../pages/UploadVideo/UploadVideo";
import PromoteVideo from "../pages/PromoteVideo/PromoteVideo";
import EditVideo from "../pages/EditVideo/EditVideo";
import WatchVideo from "../pages/WatchVideo/WatchVideo";
import Profile from "../pages/Profile/Profile";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

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
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "my-channel",
        element: (
          <PrivateRoute>
            <MyChannel />
          </PrivateRoute>
        ),
      },
      {
        path: "my-videos",
        element: (
          <PrivateRoute>
            <MyVideos />
          </PrivateRoute>
        ),
      },
      {
        path: "upload-video",
        element: (
          <PrivateRoute>
            <UploadVideo />
          </PrivateRoute>
        ),
      },
      {
        path: "promote-video",
        element: (
          <PrivateRoute>
            <PromoteVideo />
          </PrivateRoute>
        ),
      },
      {
        path: "edit-video/:id",
        element: (
          <PrivateRoute>
            <EditVideo />
          </PrivateRoute>
        ),
      },
      {
        path: "watch/:id",
        element: (
          <PrivateRoute>
            <WatchVideo />
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
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
