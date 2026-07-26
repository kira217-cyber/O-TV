export const selectAuth = (state) => state.auth;

export const selectStudioUser = (state) => state.auth.user;

export const selectToken = (state) => state.auth.token;

export const selectAuthLoading = (state) => state.auth.loading;

export const selectIsAuthenticated = (state) => {
  const { user, token } = state.auth;

  return !!token && !!user?.email;
};
