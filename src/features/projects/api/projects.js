import api from "../../../api/axios";

export const projectStatuses = [
  { value: "DRAFT", label: "Borrador" },
  { value: "IN_REVIEW", label: "En revisión" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "FUNDED", label: "Financiado" },
];

export const getProjects = async (
  { query = "", status = "", page = 0, size = 10, signal } = {},
) => {
  const { data } = await api.get("/projects", {
    params: {
      q: query.trim() || undefined,
      status: status || undefined,
      page,
      size,
      sort: "createdAt,desc",
    },
    signal,
  });

  if (
    !data ||
    !Array.isArray(data.content) ||
    !Number.isInteger(data.page) ||
    !Number.isInteger(data.size) ||
    !Number.isInteger(data.totalElements) ||
    !Number.isInteger(data.totalPages) ||
    data.content.some(
      (project) =>
        !Number.isInteger(Number(project?.id)) ||
        typeof project?.identifierCode !== "string" ||
        typeof project?.title !== "string" ||
        typeof project?.status !== "string",
    )
  ) {
    throw new Error("La respuesta de proyectos no tiene el formato esperado.");
  }

  return data;
};
