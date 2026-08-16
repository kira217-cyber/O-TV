export const selectPrivateAuth = (state) => state.privateAuth;
export const selectPrivateUser = (state) => state.privateAuth.user;
export const selectPrivateToken = (state) => state.privateAuth.token;
export const selectPrivateAuthLoading = (state) => state.privateAuth.loading;

export const selectIsPrivateAuthenticated = (state) => {
  const { user, token } = state.privateAuth;
  return !!token && !!user?.email;
};
