import { api } from "../../api/axios";

export const studioRegister = async ({ fullName, email, phone, password }) => {
  const { data } = await api.post("/api/studio/register", {
    fullName,
    email,
    phone,
    password,
  });

  return data?.data || data;
};

export const studioLogin = async ({ identifier, password }) => {
  const { data } = await api.post("/api/studio/login", {
    identifier,
    password,
  });

  return data?.data || data;
};

export const getStudioProfile = async () => {
  const { data } = await api.get("/api/studio/profile");

  return data?.data || data;
};
