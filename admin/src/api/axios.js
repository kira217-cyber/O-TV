import axios from "axios";
import { toast } from "react-toastify";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(error?.config?.headers?.Authorization);

    if (error?.response?.status === 401 && hadToken) {
      localStorage.removeItem("admin");
      localStorage.removeItem("token");

      toast.error(
        error?.response?.data?.message || "Session expired. Please login again.",
      );

      // Dynamic import avoids a circular-import deadlock: store -> authSlice
      // -> authAPI -> this file. By the time this callback runs (a real
      // 401 response), both modules are already fully loaded.
      Promise.all([
        import("../app/store"),
        import("../features/auth/authSlice"),
      ]).then(([{ store }, { logout }]) => {
        store.dispatch(logout());
      });
    }

    return Promise.reject(error);
  },
);
