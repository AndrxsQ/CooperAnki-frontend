import { useState } from "react";
import FilterPanel from "../components/FilterPanel";
import SearchBar from "../components/SearchBar";

const Searching = () => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    ods: [],
    donors: [],
    budgetMin: null,
    budgetMax: null,
    status: "all",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Buscar oportunidades
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Encuentra convocatorias y proyectos según tus criterios.
        </p>
      </div>

      <SearchBar onSearch={setQuery} />
      <FilterPanel filters={filters} onChange={setFilters} />
      <p aria-live="polite" className="sr-only">
        {query ? `Búsqueda actual: ${query}` : "Sin término de búsqueda"}
      </p>
    </div>
  );
};

export default Searching