import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import { dashboardRecords } from "../data/dashboardData";

const initialFilters = {
  municipality: "all",
  activity: "all",
};

const municipalityOptions = [
  { value: "all", label: "Todos los municipios" },
  ...Array.from(new Set(dashboardRecords.map((record) => record.municipality)))
    .sort((first, second) => first.localeCompare(second, "es"))
    .map((municipality) => ({ value: municipality, label: municipality })),
];

const activityOptions = [
  { value: "all", label: "Todas las actividades" },
  ...Array.from(new Set(dashboardRecords.map((record) => record.activity)))
    .sort((first, second) => first.localeCompare(second, "es"))
    .map((activity) => ({ value: activity, label: activity })),
];

const numberFormatter = new Intl.NumberFormat("es-CO");

const FilterSelect = ({ label, value, options, onChange }) => (
  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
    <select
      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [filters, setFilters] = useState(initialFilters);

  const filteredRecords = dashboardRecords.filter(
    (record) =>
      (filters.municipality === "all" ||
        record.municipality === filters.municipality) &&
      (filters.activity === "all" || record.activity === filters.activity),
  );
  const totalRecords = filteredRecords.reduce(
    (total, record) => total + record.count,
    0,
  );
  const municipalityCount = new Set(
    filteredRecords.map((record) => record.municipality),
  ).size;
  const nodeCount = new Set(filteredRecords.map((record) => record.node)).size;

  const activitySummary = filteredRecords.reduce((summary, record) => {
    const existingActivity = summary.find(
      (activity) => activity.name === record.activity,
    );
    if (existingActivity) {
      existingActivity.count += record.count;
    } else {
      summary.push({ name: record.activity, count: record.count });
    }
    return summary;
  }, []);
  const municipalitySummary = filteredRecords.reduce((summary, record) => {
    const existingMunicipality = summary.find(
      (municipality) => municipality.name === record.municipality,
    );
    if (existingMunicipality) {
      existingMunicipality.count += record.count;
    } else {
      summary.push({ name: record.municipality, count: record.count });
    }
    return summary;
  }, []);
  activitySummary.sort((first, second) => second.count - first.count);
  municipalitySummary.sort((first, second) => second.count - first.count);

  const updateFilter = (key) => (value) =>
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));

  const hasActiveFilters = Object.keys(initialFilters).some(
    (key) => filters[key] !== initialFilters[key],
  );

  return (
    <div className={`auth-page${isDark ? " is-dark" : ""}`}>
      <Header
        variant="landing"
        user={isAuthenticated ? user : null}
        isDark={isDark}
        onLogin={isAuthenticated ? () => navigate("/searching") : undefined}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard de ASOMUPROCA
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Datos provisionales cargados manualmente a partir del listado
            compartido.
          </p>
        </div>

        <section
          aria-label="Filtros del dashboard"
          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
        >
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
            className="h-11 shrink-0 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={!hasActiveFilters}
            onClick={() => setFilters(initialFilters)}
          >
            Limpiar filtros
          </button>
        </section>

        <section
          aria-label="Resumen de registros"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Registros", value: totalRecords },
            { label: "Municipios", value: municipalityCount },
            { label: "Nodos", value: nodeCount },
            { label: "Actividades", value: activitySummary.length },
          ].map((metric) => (
            <article
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-600">{metric.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-800">
                {numberFormatter.format(metric.value)}
              </p>
            </article>
          ))}
        </section>

        {totalRecords ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section
              aria-labelledby="dashboard-activities-title"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2
                id="dashboard-activities-title"
                className="text-base font-semibold text-slate-900"
              >
                Registros por actividad
              </h2>
              <ul className="mt-5 space-y-4">
                {activitySummary.map((activity) => (
                  <li key={activity.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium text-slate-700">
                        {activity.name}
                      </span>
                      <span className="shrink-0 font-semibold text-slate-900">
                        {numberFormatter.format(activity.count)}
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div
                        className="h-full rounded-full bg-emerald-700"
                        style={{
                          width: `${(activity.count / totalRecords) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="dashboard-municipalities-title"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2
                id="dashboard-municipalities-title"
                className="text-base font-semibold text-slate-900"
              >
                Registros por municipio
              </h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {municipalitySummary.map((municipality) => (
                  <li
                    key={municipality.name}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {municipality.name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {numberFormatter.format(municipality.count)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <section
            aria-live="polite"
            className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-700">
              No hay registros para los filtros seleccionados.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Cambia los filtros o límpialos para ver todos los datos.
            </p>
          </section>
        )}

        {totalRecords > 0 && (
          <section
            aria-labelledby="dashboard-detail-title"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <h2
                id="dashboard-detail-title"
                className="text-base font-semibold text-slate-900"
              >
                Detalle por nodo y actividad
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold" scope="col">
                      Municipio
                    </th>
                    <th className="px-5 py-3 font-semibold" scope="col">
                      Nodo
                    </th>
                    <th className="px-5 py-3 font-semibold" scope="col">
                      Actividad económica
                    </th>
                    <th className="px-5 py-3 text-right font-semibold" scope="col">
                      Registros
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => (
                    <tr key={`${record.municipality}-${record.activity}`}>
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {record.municipality}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{record.node}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {record.activity}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-800">
                        {numberFormatter.format(record.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <p className="text-xs text-slate-500">
          Información temporal y agregada; los filtros disponibles reflejan los
          campos presentes en el listado fuente.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
