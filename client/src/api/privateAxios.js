import axios from "axios";
import { toast } from "react-toastify";

// Dedicated instance for the private-video system — kept separate from the
// main client/src/api/axios.js instance (which has no auth at all) so the
// private-user token never leaks onto unrelated public requests.
export const privateApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("private_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

privateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(error?.config?.headers?.Authorization);

    if (error?.response?.status === 401 && hadToken) {
      localStorage.removeItem("private_user");
      localStorage.removeItem("private_token");

      toast.error(
        error?.response?.data?.message || "Session expired. Please login again.",
      );

      // Dynamic import avoids a circular-import deadlock: store ->
      // privateAuthSlice -> privateAuthAPI -> this file. By the time this
      // callback runs (a real 401 response), both modules are already
      // fully loaded.
      Promise.all([
        import("../app/store"),
        import("../features/privateAuth/privateAuthSlice"),
      ]).then(([{ store }, { logout }]) => {
        store.dispatch(logout());
      });
    }

    return Promise.reject(error);
  },
);
