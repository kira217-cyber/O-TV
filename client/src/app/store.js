import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import privateAuthReducer from "../features/privateAuth/privateAuthSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    privateAuth: privateAuthReducer,
  },
});
