import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { LanguageProvider } from "./Context/LanguageProvider";
import { routes } from "./router/router";
import { store } from "./app/store";
import { rehydrateAuth } from "./features/auth/authSlice";
import { rehydrateAuth as rehydratePrivateAuth } from "./features/privateAuth/privateAuthSlice";

const queryClient = new QueryClient();

/**
 * 🔁 Context useEffect equivalent
 */
const BootstrapAuth = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(rehydrateAuth());
    dispatch(rehydratePrivateAuth());
  }, [dispatch]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <SkeletonTheme baseColor="#1c2426" highlightColor="#2c3638">
            <BootstrapAuth>
              <ToastContainer position="top-right" />
              <RouterProvider router={routes} />
            </BootstrapAuth>
          </SkeletonTheme>
        </LanguageProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
