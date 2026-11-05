import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { getEconomicUnits } from "../api/economicUnits";

const initialFilters = {
  name: "",
  department: "all",
  municipality: "all",
  activity: "all",
};

const pageSizeOptions = [10, 25, 50, 100];
const numberFormatter = new Intl.NumberFormat("es-CO");

const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

const FilterSelect = ({ label, value, options, onChange, disabled = false }) => (
  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <select
      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const DetailedView = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    units: [],
    departments: [],
    municipalities: [],
    activities: [],
  });
  const [request, setRequest] = useState({ key: null, status: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [searchResetKey, setSearchResetKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getEconomicUnits(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setRequest({ key: retryKey, status: "success" });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({
            key: retryKey,
            status: "error",
            message:
              error.response?.data?.message ??
              error.message ??
              "No se pudieron cargar los datos del backend.",
          });
        }
      });

    return () => controller.abort();
  }, [retryKey]);

  const loading =
    request.key !== retryKey || request.status === "loading";
  const loadError =
    request.key === retryKey && request.status === "error"
      ? request.message
      : "";
  const departmentOptions = [
    { value: "all", label: "Todos los departamentos" },
    ...data.departments
      .slice()
      .sort((first, second) => first.name.localeCompare(second.name, "es"))
      .map((department) => ({
        value: String(department.id),
        label: department.name,
      })),
  ];
  const municipalityOptions = [
    { value: "all", label: "Todos los municipios" },
    ...data.municipalities
      .filter(
        (municipality) =>
          filters.department === "all" ||
          String(municipality.departmentId) === filters.department,
      )
      .slice()
      .sort((first, second) => first.name.localeCompare(second.name, "es"))
      .map((municipality) => ({
        value: String(municipality.id),
        label: municipality.name,
      })),
  ];
  const activityOptions = [
    { value: "all", label: "Todas las actividades" },
    ...data.activities
      .slice()
      .sort((first, second) => first.name.localeCompare(second.name, "es"))
      .map((activity) => ({
        value: String(activity.ciiuId),
        label: activity.name,
      })),
  ];

  const filteredRecords = data.units.filter(
    (record) =>
      (!filters.name ||
        normalizeSearchText(record.name).includes(
          normalizeSearchText(filters.name),
        )) &&
        (filters.department === "all" ||
          String(record.departmentId) === filters.department) &&
        (filters.municipality === "all" ||
          String(record.municipalityId) === filters.municipality) &&
        (filters.activity === "all" ||
          record.activities.some(
            (activity) => String(activity.ciiuId) === filters.activity,
          )),
  );
  const totalRecords = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const pageRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const firstVisibleRecord = totalRecords
    ? (currentPage - 1) * pageSize + 1
    : 0;
  const lastVisibleRecord = Math.min(currentPage * pageSize, totalRecords);

  const updateFilter = (key) => (value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
      ...(key === "department" ? { municipality: "all" } : {}),
    }));
    setCurrentPage(1);
  };

  return (
    <section
      aria-labelledby="overview-title"
      className="grid scroll-mt-24 gap-6"
    >
      <div className="grid gap-2">
        <h1
          id="overview-title"
          className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Vista General
        </h1>
        <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Consulta y filtra las unidades económicas de la organización.
        </p>
      </div>

      <section
        aria-label="Filtros de registros"
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <SearchBar
          key={searchResetKey}
          label="Buscar mujeres por nombre"
          placeholder="Buscar por nombre..."
          debounceMs={250}
          onSearch={(name) => updateFilter("name")(name)}
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <FilterSelect
            label="Departamento"
            value={filters.department}
            options={departmentOptions}
            onChange={updateFilter("department")}
            disabled={loading || Boolean(loadError)}
          />
          <FilterSelect
            label="Municipio"
            value={filters.municipality}
            options={municipalityOptions}
            onChange={updateFilter("municipality")}
            disabled={loading || Boolean(loadError)}
          />
          <FilterSelect
            label="Actividad económica"
            value={filters.activity}
            options={activityOptions}
            onChange={updateFilter("activity")}
            disabled={loading || Boolean(loadError)}
          />
          <button
            className="h-11 shrink-0 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
            disabled={
              loading ||
              Boolean(loadError) ||
              (filters.name === initialFilters.name &&
                filters.department === initialFilters.department &&
                filters.municipality === initialFilters.municipality &&
                filters.activity === initialFilters.activity)
            }
            onClick={() => {
              setFilters(initialFilters);
              setSearchResetKey((key) => key + 1);
              setCurrentPage(1);
            }}
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section
        aria-labelledby="records-title"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2
            id="records-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Unidades económicas
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {numberFormatter.format(totalRecords)} registros encontrados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                {[
                  "Documento",
                  "Nombre",
                  "Edad",
                  "Departamento",
                  "Municipio",
                  "Nodo",
                  "Actividad económica",
                  "Dirección",
                  "Teléfono",
                  "Correo electrónico",
                  "Organización",
                ].map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-4 py-3 font-semibold"
                    scope="col"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-slate-500 dark:text-slate-300"
                    colSpan={11}
                  >
                    Cargando unidades económicas...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-rose-700 dark:text-rose-300"
                    colSpan={11}
                  >
                    <p>{loadError}</p>
                    <button
                      className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                      type="button"
                      onClick={() => setRetryKey((key) => key + 1)}
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              ) : pageRecords.length ? (
                pageRecords.map((record) => (
                  <tr
                    key={record.id}
                    aria-label={`Ver perfil de ${record.name}`}
                    className="h-12 cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-emerald-700 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800"
                    onClick={() => navigate(`/economic-units/${record.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/economic-units/${record.id}`);
                      }
                    }}
                    tabIndex={0}
                  >
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.documentNumber ?? "No especificado"}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                      {record.name}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.age ?? "No especificada"}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.department}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.municipality}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.node}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.activity || "Sin actividades registradas"}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.address ?? "No especificada"}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.phone ?? "No especificado"}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.email ?? "No especificado"}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {record.organization}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-slate-500 dark:text-slate-300"
                    colSpan={11}
                  >
                    No hay registros para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          aria-label="Paginación de registros"
          className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700"
        >
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            Mostrar
            <select
              aria-label="Cantidad de registros por página"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              disabled={loading || Boolean(loadError)}
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            por página
          </label>

          <p aria-live="polite" className="text-sm text-slate-600 dark:text-slate-300">
            Mostrando {numberFormatter.format(firstVisibleRecord)}–
            {numberFormatter.format(lastVisibleRecord)} de{" "}
            {numberFormatter.format(totalRecords)} registros
          </p>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
            >
              Anterior
            </button>
            <span className="px-2 text-sm text-slate-600 dark:text-slate-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default DetailedView;
