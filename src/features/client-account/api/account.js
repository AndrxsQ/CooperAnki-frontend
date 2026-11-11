import api from "../../../api/axios";

const normalizeAccount = (data) => {
  if (
    !data ||
    (typeof data.id !== "number" && typeof data.id !== "string") ||
    typeof data.fullName !== "string" ||
    typeof data.email !== "string" ||
    typeof data.role !== "string" ||
    typeof data.active !== "boolean" ||
    typeof data.emailNotificationsEnabled !== "boolean"
  ) {
    throw new Error("La respuesta de la cuenta no tiene el formato esperado.");
  }

  return data;
};

export const getMyAccount = async (signal) => {
  const { data } = await api.get("/account/me", { signal });
  return normalizeAccount(data);
};

export const updateMyAccount = async (account) => {
  const { data } = await api.put("/account/me", account);
  return normalizeAccount(data);
};

export const updateEmailNotifications = async (enabled) => {
  const { data } = await api.patch("/account/me/preferences", {
    emailNotificationsEnabled: enabled,
  });
  return normalizeAccount(data);
};

export const updateMyPassword = async (passwords) => {
  await api.patch("/account/me/password", passwords);
};
