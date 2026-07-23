import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { routes } from "./router/router";
import { store } from "./app/store";
import { rehydrateAuth } from "./features/auth/authSlice";

const BootstrapAuth = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BootstrapAuth>
        <ToastContainer position="top-right" theme="dark" />
        <RouterProvider router={routes} />
      </BootstrapAuth>
    </Provider>
  </StrictMode>,
);
