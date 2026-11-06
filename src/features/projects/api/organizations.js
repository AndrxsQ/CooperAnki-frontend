import api from "../../../api/axios";

export const getOrganizations = async (signal) => {
  const { data } = await api.get("/organizations", { signal });

  if (
    !Array.isArray(data) ||
    data.some(
      (organization) =>
        !Number.isInteger(Number(organization?.id)) ||
        typeof organization?.name !== "string" ||
        !organization.name.trim(),
    )
  ) {
    throw new Error("La respuesta de organizaciones no tiene el formato esperado.");
  }

  return data.map(({ id, name, departmentName, municipalityName }) => ({
    id: Number(id),
    name,
    location: [municipalityName, departmentName].filter(Boolean).join(", "),
  }));
};
