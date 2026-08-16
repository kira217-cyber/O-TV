import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPrivateUserProfile } from "./privateAuthAPI";

export const rehydrateAuth = createAsyncThunk(
  "privateAuth/rehydrateAuth",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = localStorage.getItem("private_user");
      const storedToken = localStorage.getItem("private_token");

      if (!storedUser || !storedToken) {
        return { user: null, token: null };
      }

      return {
        user: JSON.parse(storedUser),
        token: storedToken,
      };
    } catch {
      localStorage.removeItem("private_user");
      localStorage.removeItem("private_token");

      return rejectWithValue("Auth restore failed");
    }
  },
);

export const fetchPrivateUserProfile = createAsyncThunk(
  "privateAuth/fetchPrivateUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getPrivateUserProfile();
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
  token: localStorage.getItem("private_token") || null,
  loading: true,
  error: null,
};

const privateAuthSlice = createSlice({
  name: "privateAuth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.loading = false;
      state.error = null;

      localStorage.setItem("private_user", JSON.stringify(user));
      localStorage.setItem("private_token", token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("private_user");
      localStorage.removeItem("private_token");
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
      .addCase(fetchPrivateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;

        localStorage.setItem("private_user", JSON.stringify(action.payload));
      })
      .addCase(fetchPrivateUserProfile.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.error = action.payload || "Unauthorized";

        localStorage.removeItem("private_user");
        localStorage.removeItem("private_token");
      });
  },
});

export const { setCredentials, logout, clearAuthError } = privateAuthSlice.actions;

export default privateAuthSlice.reducer;
