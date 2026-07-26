import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStudioProfile } from "./authAPI";

export const rehydrateAuth = createAsyncThunk(
  "auth/rehydrateAuth",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = localStorage.getItem("studio_user");
      const storedToken = localStorage.getItem("studio_token");

      if (!storedUser || !storedToken) {
        return { user: null, token: null };
      }

      return {
        user: JSON.parse(storedUser),
        token: storedToken,
      };
    } catch {
      localStorage.removeItem("studio_user");
      localStorage.removeItem("studio_token");

      return rejectWithValue("Auth restore failed");
    }
  },
);

export const fetchStudioProfile = createAsyncThunk(
  "auth/fetchStudioProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getStudioProfile();

      return data.user;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Profile load failed",
      );
    }
  },
);

const initialState = {
  user: null,
  token: localStorage.getItem("studio_token") || null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.loading = false;
      state.error = null;

      localStorage.setItem("studio_user", JSON.stringify(user));
      localStorage.setItem("studio_token", token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("studio_user");
      localStorage.removeItem("studio_token");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(rehydrateAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(rehydrateAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
      })
      .addCase(rehydrateAuth.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = action.payload || "Auth restore failed";
      })

      // Note: intentionally no `.pending` handler here — this thunk is
      // dispatched in the background (e.g. on Sidebar mount) to silently
      // re-validate the session against the server. Setting `loading`
      // would unmount/remount the authenticated layout via PrivateRoute,
      // which would re-fire this same effect and loop forever.
      .addCase(fetchStudioProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;

        localStorage.setItem("studio_user", JSON.stringify(action.payload));
      })
      .addCase(fetchStudioProfile.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.error = action.payload || "Unauthorized";

        localStorage.removeItem("studio_user");
        localStorage.removeItem("studio_token");
      });
  },
});

export const { setCredentials, logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
