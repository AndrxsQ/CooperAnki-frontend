import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import {
  dashboardDepartments,
  dashboardRecords,
} from "../data/dashboardData";

const initialFilters = {
  name: "",
  department: "all",
  municipality: "all",
  activity: "all",
};

const pageSizeOptions = [10, 25, 50, 100];
const numberFormatter = new Intl.NumberFormat("es-CO");

const municipalityOptions = [
  { value: "all", label: "Todos los municipios" },
  ...Array.from(new Set(dashboardRecords.map((record) => record.municipality)))
    .sort((first, second) => first.localeCompare(second, "es"))
    .map((municipality) => ({ value: municipality, label: municipality })),
];

const departmentOptions = [
  { value: "all", label: "Todos los departamentos" },
  ...Array.from(
    new Set([
      ...dashboardDepartments,
      ...dashboardRecords.map((record) => record.department),
    ]),
  )
    .sort((first, second) => first.localeCompare(second, "es"))
    .map((department) => ({ value: department, label: department })),
];

const activityNames = [
  "Cultivo de cereales y otros cultivos n.c.p.",
  "Cultivo de hortalizas y legumbres, especialidades hortícolas y productos de vivero",
  "Cultivo de frutas, nueces, plantas cuyas hojas o frutos se utilizan para preparar bebidas, y especias",
  "Cría de ganado vacuno y de ovejas, cabras, caballos, asnos, mulas y burdéganos",
  "Cría de otros animales; elaboración de productos animales n.c.p.",
  "Cultivo de productos agrícolas en combinación con la cría de animales (explotación mixta)",
  "Actividades de servicios agrícolas y ganaderos, excepto las actividades veterinarias",
  "Caza ordinaria y mediante trampas, y repoblación de animales de caza, incluso actividades conexas",
  "Silvicultura, extracción de madera y actividades de servicios conexas",
  "Pesca",
  "Acuicultura",
  "Producción, procesamiento y conservación de carne y productos cárnicos",
  "Elaboración y conservación de pescado y productos de pescado",
  "Elaboración y conservación de frutas, legumbres y hortalizas",
  "Elaboración de aceites y grasas de origen vegetal y animal",
  "Elaboración de productos lácteos",
  "Elaboración de productos de molinería",
  "Elaboración de alimentos preparados para animales",
  "Venta al por mayor de alimentos, bebidas y tabaco",
  "Investigaciones y desarrollo experimental en el campo de las ciencias naturales y la ingeniería",
  "Actividades de la administración pública en general",
  "Regulación de las actividades de organismos que prestan servicios sanitarios, educativos y sociales",
  "Regulación y facilitación de la actividad económica",
  "Actividades de servicios de apoyo para la administración pública en general",
  "Relaciones exteriores",
  "Actividades de defensa",
  "Actividades de mantenimiento del orden público y de seguridad",
  "Actividades de planes de seguridad social de afiliación obligatoria",
  "Actividades veterinarias",
];

const activityOptions = [
  { value: "all", label: "Todas las actividades" },
  ...activityNames.map((activity) => ({ value: activity, label: activity })),
];

const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

const FilterSelect = ({ label, value, options, onChange }) => (
  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <select
      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [searchResetKey, setSearchResetKey] = useState(0);

  const filteredRecords = dashboardRecords.filter(
    (record) =>
      (!filters.name ||
        normalizeSearchText(record.name).includes(
          normalizeSearchText(filters.name),
        )) &&
        (filters.department === "all" ||
          record.department === filters.department) &&
        (filters.municipality === "all" ||
          record.municipality === filters.municipality) &&
        (filters.activity === "all" ||
          record.activity.includes(filters.activity)),
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
          />
          <FilterSelect
            label="Municipio"
            value={filters.municipality}
            options={municipalityOptions}
            onChange={updateFilter("municipality")}
          />
          <FilterSelect
            label="Actividad económica"
            value={filters.activity}
            options={activityOptions}
            onChange={updateFilter("activity")}
          />
          <button
            className="h-11 shrink-0 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
            disabled={
              filters.name === initialFilters.name &&
              filters.department === initialFilters.department &&
              filters.municipality === initialFilters.municipality &&
              filters.activity === initialFilters.activity
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
              {pageRecords.length ? (
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
