import api from "../../../api/axios";

export const getAvailableRoles = async (signal) => {
  const { data } = await api.get("/auth/roles", { signal });

  if (
    !Array.isArray(data) ||
    data.some(
      (role) =>
        !Number.isInteger(Number(role?.id)) ||
        Number(role.id) <= 0 ||
        typeof role?.name !== "string" ||
        !role.name.trim(),
    )
  ) {
    throw new Error("La respuesta de roles no tiene el formato esperado.");
  }

  return data.map(({ id, name, description }) => ({
    id: Number(id),
    name,
    description: typeof description === "string" ? description : "",
  }));
};

export const createUser = async (user) => {
  const { data } = await api.post("/auth/register", user);

  if (
    !data ||
    !Number.isInteger(Number(data.id)) ||
    typeof data.fullName !== "string" ||
    typeof data.email !== "string" ||
    typeof data.role !== "string" ||
    typeof data.active !== "boolean"
  ) {
    throw new Error("La respuesta del registro no tiene el formato esperado.");
  }

  return data;
};
