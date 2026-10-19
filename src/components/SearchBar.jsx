import { useEffect, useRef, useState } from "react";

const SearchBar = ({ onSearch, debounceMs = 400, placeholder = "Buscar oportunidades..." }) => {
  const [query, setQuery] = useState("");
  const onSearchRef = useRef(onSearch);
  const isFirstRender = useRef(true);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onSearchRef.current(query.trim());
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return (
    <label className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15">
      <svg
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path strokeLinecap="round" d="m16 16 4.5 4.5" />
      </svg>
      <span className="sr-only">Buscar oportunidades</span>
      <input
        className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
      />
      {query && (
        <button
          aria-label="Limpiar búsqueda"
          className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          type="button"
          onClick={() => setQuery("")}
        >
          Limpiar
        </button>
      )}
    </label>
  );
};

export default SearchBar;
