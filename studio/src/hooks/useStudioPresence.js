import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { io } from "socket.io-client";

import { api } from "../api/axios";

// Reports this Studio user as "online" + "browsing <path>" on the live
// Site Analytics dashboard in admin — connects once while logged in,
// disconnects on logout/unmount. Purely presence, nothing persisted.
export const useStudioPresence = () => {
  const socketRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("studio_token");
    if (!token) return undefined;

    const socket = io(`${api.defaults.baseURL}/analytics-feed`, {
      auth: { role: "studio", token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    socketRef.current?.emit("page:view", { path: location.pathname });
  }, [location.pathname]);
};

export default useStudioPresence;
