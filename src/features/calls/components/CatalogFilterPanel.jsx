const emptyFilters = {
  q: "",
  impactArea: "",
  donorCountry: "",
  currency: "",
  minAmount: "",
  maxAmount: "",
  closingBefore: "",
  closingAfter: "",
};

const inputClass =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

const labelClass =
  "grid gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300";

const CatalogFilterPanel = ({ filters, onChange, onApply, isLoading }) => {
  const updateFilter = (key) => (event) => {
    onChange({ ...filters, [key]: event.target.value });
  };

  const hasInvalidAmountRange =
    filters.minAmount !== "" &&
    filters.maxAmount !== "" &&
    Number(filters.minAmount) > Number(filters.maxAmount);
  const hasInvalidClosingRange =
    filters.closingAfter !== "" &&
    filters.closingBefore !== "" &&
    filters.closingAfter > filters.closingBefore;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasInvalidAmountRange || hasInvalidClosingRange) return;

    onApply(filters);
  };

  return (
    <form
      aria-labelledby="catalog-filters-heading"
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      onSubmit={handleSubmit}
    >
      <div>
        <h2
          className="m-0 text-base font-semibold text-slate-900 dark:text-slate-100"
          id="catalog-filters-heading"
        >
          Filtrar el catálogo
        </h2>
        <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
          Se aplican sobre todas las convocatorias registradas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className={`${labelClass} md:col-span-2`}>
          Búsqueda
          <input
            className={inputClass}
            type="search"
            value={filters.q}
            onChange={updateFilter("q")}
            placeholder="Título, entidad o descripción"
          />
        </label>

        <label className={labelClass}>
          Área de impacto
          <input
            className={inputClass}
            type="text"
            value={filters.impactArea}
            onChange={updateFilter("impactArea")}
            placeholder="Ej. educación"
          />
        </label>

        <label className={labelClass}>
          País del donante
          <input
            className={inputClass}
            type="text"
            value={filters.donorCountry}
            onChange={updateFilter("donorCountry")}
            placeholder="Ej. PAISES BAJOS"
          />
        </label>

        <label className={labelClass}>
          Moneda
          <input
            className={inputClass}
            type="text"
            value={filters.currency}
            onChange={updateFilter("currency")}
            placeholder="Ej. USD"
          />
        </label>

        <label className={labelClass}>
          Monto máximo desde
          <input
            className={inputClass}
            min="0"
            step="any"
            type="number"
            value={filters.minAmount}
            onChange={updateFilter("minAmount")}
          />
        </label>

        <label className={labelClass}>
          Monto máximo hasta
          <input
            className={inputClass}
            min="0"
            step="any"
            type="number"
            value={filters.maxAmount}
            onChange={updateFilter("maxAmount")}
          />
        </label>

        <label className={labelClass}>
          Cierre después de
          <input
            className={inputClass}
            type="date"
            value={filters.closingAfter}
            onChange={updateFilter("closingAfter")}
          />
        </label>

        <label className={labelClass}>
          Cierre antes de
          <input
            className={inputClass}
            type="date"
            value={filters.closingBefore}
            onChange={updateFilter("closingBefore")}
          />
        </label>
      </div>

      {hasInvalidAmountRange && (
        <p className="m-0 text-sm text-rose-700 dark:text-rose-300" role="alert">
          El monto mínimo no puede superar el monto máximo.
        </p>
      )}

      {hasInvalidClosingRange && (
        <p className="m-0 text-sm text-rose-700 dark:text-rose-300" role="alert">
          La fecha de cierre inicial no puede ser posterior a la final.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          disabled={isLoading || hasInvalidAmountRange || hasInvalidClosingRange}
          type="submit"
        >
          Aplicar filtros
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          disabled={isLoading}
          type="button"
          onClick={() => {
            onChange(emptyFilters);
            onApply(emptyFilters);
          }}
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
};

export default CatalogFilterPanel;
