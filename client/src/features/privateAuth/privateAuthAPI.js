import { privateApi } from "../../api/privateAxios";

export const privateUserLogin = async ({ identifier, password }) => {
  const { data } = await privateApi.post("/api/private/login", { identifier, password });
  return data?.data || data;
};

export const getPrivateUserProfile = async () => {
  const { data } = await privateApi.get("/api/private/profile");
  return data?.data || data;
};
