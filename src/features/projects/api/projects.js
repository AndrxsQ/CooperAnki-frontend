import api from "../../../api/axios";

export const projectStatuses = [
  { value: "DRAFT", label: "Borrador" },
  { value: "IN_REVIEW", label: "En revisión" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "FUNDED", label: "Financiado" },
];

const isProjectResponse = (project) =>
  project &&
  Number.isInteger(Number(project.id)) &&
  Number.isInteger(Number(project.organizationId)) &&
  typeof project.identifierCode === "string" &&
  typeof project.title === "string" &&
  typeof project.status === "string";

const requireProjectResponse = (data) => {
  if (!isProjectResponse(data)) {
    throw new Error("La respuesta del proyecto no tiene el formato esperado.");
  }
  return data;
};

export const getProjectById = async (id, signal) => {
  const { data } = await api.get(`/projects/${encodeURIComponent(id)}`, {
    signal,
  });
  return requireProjectResponse(data);
};

export const createProject = async (project) => {
  const { data } = await api.post("/projects", project);
  return requireProjectResponse(data);
};

export const updateProject = async (id, project) => {
  const { data } = await api.put(
    `/projects/${encodeURIComponent(id)}`,
    project,
  );
  return requireProjectResponse(data);
};

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
    data.content.some((project) => !isProjectResponse(project))
  ) {
    throw new Error("La respuesta de proyectos no tiene el formato esperado.");
  }

  return data;
};
