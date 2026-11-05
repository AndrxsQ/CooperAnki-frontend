import api from "./axios";

const requireArray = (data, resource) => {
  if (!Array.isArray(data)) {
    throw new Error(`La respuesta de ${resource} no tiene el formato esperado.`);
  }
  return data;
};

const mapActivities = (activities) =>
  requireArray(activities, "actividades económicas").map(({ ciiuId, name }) => ({
    ciiuId: String(ciiuId),
    name,
  }));

export const mapEconomicUnit = (unit) => {
  const activities = mapActivities(unit.activities);

  return {
    id: unit.id,
    documentNumber: unit.docNumber,
    name: unit.name,
    age: unit.age,
    departmentId: unit.departmentId,
    department: unit.departmentName,
    municipalityId: unit.municipalityId,
    municipality: unit.municipalityName,
    nodeId: unit.nodeId,
    node: unit.nodeName,
    activities,
    activity: activities.map(({ name }) => name).join(", "),
    address: unit.address,
    phone: unit.telNumber,
    email: unit.email,
    organizationId: unit.organizationId,
    organization: unit.organizationName,
  };
};

export const getEconomicUnits = async (signal) => {
  const [unitsResponse, departmentsResponse, municipalitiesResponse, activitiesResponse] =
    await Promise.all([
      api.get("/economic-units", { signal }),
      api.get("/departments", { signal }),
      api.get("/municipalities", { signal }),
      api.get("/economic-activities", { signal }),
    ]);

  return {
    units: requireArray(unitsResponse.data, "unidades económicas").map(
      mapEconomicUnit,
    ),
    departments: requireArray(departmentsResponse.data, "departamentos"),
    municipalities: requireArray(municipalitiesResponse.data, "municipios"),
    activities: requireArray(activitiesResponse.data, "actividades económicas"),
  };
};

export const getEconomicUnitById = async (id, signal) => {
  const response = await api.get(
    `/economic-units/${encodeURIComponent(id)}`,
    { signal },
  );
  return mapEconomicUnit(response.data);
};
