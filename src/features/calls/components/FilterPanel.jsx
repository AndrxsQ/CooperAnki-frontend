import { useState } from "react";

const sdgGoals = [
  { id: 1, name: "Fin de la pobreza", color: "#e5243b" },
  { id: 2, name: "Hambre cero", color: "#dda63a" },
  { id: 3, name: "Salud y bienestar", color: "#4c9f38" },
  { id: 4, name: "Educación de calidad", color: "#c5192d" },
  { id: 5, name: "Igualdad de género", color: "#ff3a21" },
  { id: 6, name: "Agua limpia y saneamiento", color: "#26bde2" },
  { id: 7, name: "Energía asequible y no contaminante", color: "#fcc30b" },
  { id: 8, name: "Trabajo decente y crecimiento económico", color: "#a21942" },
  { id: 9, name: "Industria, innovación e infraestructura", color: "#fd6925" },
  { id: 10, name: "Reducción de las desigualdades", color: "#dd1367" },
  { id: 11, name: "Ciudades y comunidades sostenibles", color: "#fd9d24" },
  { id: 12, name: "Producción y consumo responsables", color: "#bf8b2e" },
  { id: 13, name: "Acción por el clima", color: "#3f7e44" },
  { id: 14, name: "Vida submarina", color: "#0a97d9" },
  { id: 15, name: "Vida de ecosistemas terrestres", color: "#56c02b" },
  { id: 16, name: "Paz, justicia e instituciones sólidas", color: "#00689d" },
  { id: 17, name: "Alianzas para lograr los objetivos", color: "#19486a" },
];

const donorOrganizations = [
  "AECID",
  "BID",
  "Banco Mundial",
  "Agencias ONU",
  "Unión Europea",
  "USAID",
  "Otros organismos",
];

const statusOptions = [
  { value: "active", label: "Solo activas" },
  { value: "expiring", label: "Próximas a vencer (< 30 días)" },
  { value: "all", label: "Ver todas" },
];

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatCurrencyInput = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return currencyFormatter.format(Number(value));
};

const CurrencyInput = ({ id, label, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleFocus = () => {
    setFocused(true);
    setInputValue(value === null || value === undefined ? "" : String(value));
  };

  const handleChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    setInputValue(digits);
    onChange(digits === "" ? null : Number(digits));
  };

  return (
    <label className="block min-w-0 flex-1 text-xs font-medium text-slate-600" htmlFor={id}>
      {label}
      <span className="mt-1.5 flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15">
        <input
          className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:ring-0"
          id={id}
          inputMode="numeric"
          value={focused ? inputValue : formatCurrencyInput(value)}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          placeholder="$ 0"
        />
      </span>
    </label>
  );
};

const FilterPanel = ({ filters, onChange }) => {
  const [donorsOpen, setDonorsOpen] = useState(false);

  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleOds = (id) => {
    const selected = filters.ods.includes(id);
    updateFilter(
      "ods",
      selected ? filters.ods.filter((goalId) => goalId !== id) : [...filters.ods, id],
    );
  };

  const toggleDonor = (donor) => {
    const selected = filters.donors.includes(donor);
    updateFilter(
      "donors",
      selected
        ? filters.donors.filter((selectedDonor) => selectedDonor !== donor)
        : [...filters.donors, donor],
    );
  };

  const clearFilters = () => {
    onChange({
      ods: [],
      donors: [],
      budgetMin: null,
      budgetMax: null,
      status: "all",
    });
  };

  return (
    <section aria-labelledby="filters-heading" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900" id="filters-heading">
            Filtros avanzados
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Combina criterios para encontrar oportunidades relevantes.
          </p>
        </div>
        <button
          className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
          type="button"
          onClick={clearFilters}
        >
          Limpiar filtros
        </button>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700">
          Objetivos de Desarrollo Sostenible
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
          {sdgGoals.map((goal) => {
            const selected = filters.ods.includes(goal.id);
            return (
              <button
                key={goal.id}
                aria-label={`ODS ${goal.id}: ${goal.name}`}
                aria-pressed={selected}
                className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected ? "border-emerald-950 ring-2 ring-emerald-700/20" : "border-transparent"
                }`}
                style={{ backgroundColor: goal.color }}
                title={`ODS ${goal.id}: ${goal.name}`}
                type="button"
                onClick={() => toggleOds(goal.id)}
              >
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={`https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-${String(goal.id).padStart(2, "0")}.jpg`}
                />
                <span className="sr-only">
                  {selected ? "Seleccionado" : "No seleccionado"}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 block text-sm font-semibold text-slate-700">
            Organismo donante
          </p>
          <details
            className="group relative"
            open={donorsOpen}
            onToggle={(event) => setDonorsOpen(event.currentTarget.open)}
          >
            <summary
              className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:border-slate-300 [&::-webkit-details-marker]:hidden"
              id="donor-toggle"
            >
              <span className="truncate">
                {filters.donors.length
                  ? `${filters.donors.length} organismo${filters.donors.length > 1 ? "s" : ""} seleccionado${filters.donors.length > 1 ? "s" : ""}`
                  : "Seleccionar organismos"}
              </span>
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <fieldset className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <legend className="sr-only">Selecciona uno o varios organismos donantes</legend>
              {donorOrganizations.map((donor) => (
                <label
                  key={donor}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    checked={filters.donors.includes(donor)}
                    className="h-4 w-4 rounded border-slate-300 accent-emerald-800"
                    type="checkbox"
                    onChange={() => toggleDonor(donor)}
                  />
                  {donor}
                </label>
              ))}
            </fieldset>
          </details>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-700">
            Rango presupuestal (COP)
          </legend>
          <div className="flex items-center gap-2">
            <CurrencyInput
              id="budget-min"
              label="Mínimo"
              value={filters.budgetMin}
              onChange={(value) => updateFilter("budgetMin", value)}
            />
            <span aria-hidden="true" className="mt-5 text-slate-400">—</span>
            <CurrencyInput
              id="budget-max"
              label="Máximo"
              value={filters.budgetMax}
              onChange={(value) => updateFilter("budgetMax", value)}
            />
          </div>
        </fieldset>
      </div>

      <fieldset className="mt-6 border-t border-slate-100 pt-5">
        <legend className="mb-3 text-sm font-semibold text-slate-700">
          Fecha de cierre y estado
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {statusOptions.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
            >
              <input
                checked={filters.status === value}
                className="h-4 w-4 accent-emerald-800"
                name="opportunity-status"
                type="checkbox"
                onChange={() => updateFilter("status", value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
};

export default FilterPanel;
