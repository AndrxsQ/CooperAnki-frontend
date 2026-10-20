import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import { odsGoals } from "../data/ods";

const periodOptions = [
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "year", label: "Este año" },
  { value: "all", label: "Todo el periodo" },
];

const odsOptions = [
  { value: "all", label: "Todos los ODS" },
  ...odsGoals.map((goal) => ({
    value: String(goal.id),
    label: `${goal.id}. ${goal.name}`,
  })),
];

const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activas" },
  { value: "closed", label: "Cerradas" },
];

const initialFilters = {
  period: "30d",
  ods: "all",
  status: "all",
};

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
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Resumen general de la información.
          </p>
        </div>

        <section
          aria-label="Filtros del dashboard"
          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end"
        >
          <FilterSelect
            label="Periodo"
            value={filters.period}
            options={periodOptions}
            onChange={updateFilter("period")}
          />
          <FilterSelect
            label="ODS"
            value={filters.ods}
            options={odsOptions}
            onChange={updateFilter("ods")}
          />
          <FilterSelect
            label="Estado"
            value={filters.status}
            options={statusOptions}
            onChange={updateFilter("status")}
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
          aria-labelledby="dashboard-data-title"
          className="rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-200 px-5 py-4">
            <h2
              id="dashboard-data-title"
              className="text-base font-semibold text-slate-900"
            >
              Datos
            </h2>
          </div>
          <div className="flex min-h-80 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Aún no hay datos para mostrar
            </p>
            <p className="max-w-md text-sm text-slate-500">
              Aquí se desplegará la información del dashboard según los filtros
              seleccionados.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
