import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { getEconomicUnits } from "../api/economicUnits";
import { createTemporaryLegalClients } from "../data/legalClientData";

const pageSizeOptions = [10, 25, 50];
const numberFormatter = new Intl.NumberFormat("es-CO");
const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

const FilterSelect = ({ label, value, options, onChange, disabled }) => (
  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <select
      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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

const LegalClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [request, setRequest] = useState({ key: null, status: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const [caseNumber, setCaseNumber] = useState("all");
  const [filingNumber, setFilingNumber] = useState("all");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  useEffect(() => {
    const controller = new AbortController();

    getEconomicUnits(controller.signal)
      .then(({ units }) => {
        if (!controller.signal.aborted) {
          setClients(createTemporaryLegalClients(units));
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
              "No se pudieron cargar las unidades económicas.",
          });
        }
      });

    return () => controller.abort();
  }, [retryKey]);

  const loading = request.key !== retryKey || request.status === "loading";
  const loadError =
    request.key === retryKey && request.status === "error"
      ? request.message
      : "";

  const caseOptions = useMemo(
    () => [
      { value: "all", label: "Todos los expedientes" },
      ...clients
        .map((client) => client.caseNumber)
        .sort((first, second) => second.localeCompare(first, "es"))
        .map((value) => ({ value, label: value })),
    ],
    [clients],
  );
  const filingOptions = useMemo(
    () => [
      { value: "all", label: "Todos los radicados" },
      ...clients
        .map((client) => client.filingNumber)
        .sort((first, second) => first.localeCompare(second, "es"))
        .map((value) => ({ value, label: value })),
    ],
    [clients],
  );

  const filteredClients = useMemo(
    () =>
      clients
        .filter(
          (client) =>
            (!search ||
              normalizeSearchText(
                `${client.name} ${client.documentNumber}`,
              ).includes(normalizeSearchText(search))) &&
            (caseNumber === "all" || client.caseNumber === caseNumber) &&
            (filingNumber === "all" || client.filingNumber === filingNumber),
        )
        .sort(
          (first, second) =>
            new Date(second.lastActivityAt) - new Date(first.lastActivityAt),
        ),
    [caseNumber, clients, filingNumber, search],
  );

  const totalRecords = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const pageClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const firstVisibleRecord = totalRecords ? (currentPage - 1) * pageSize + 1 : 0;
  const lastVisibleRecord = Math.min(currentPage * pageSize, totalRecords);
  const hasFilters =
    Boolean(search) || caseNumber !== "all" || filingNumber !== "all";

  const clearFilters = () => {
    setSearch("");
    setCaseNumber("all");
    setFilingNumber("all");
    setSearchResetKey((key) => key + 1);
    setCurrentPage(1);
  };

  return (
    <section
      aria-labelledby="legal-clients-title"
      className="grid scroll-mt-24 gap-6"
    >
      <div className="grid gap-2">
        <h1
          id="legal-clients-title"
          className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Clientes
        </h1>
        <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Consulta las unidades económicas registradas y encuentra rápidamente
          sus expedientes y radicados.
        </p>
      </div>

      <section
        aria-label="Filtros de clientes"
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <SearchBar
          key={searchResetKey}
          label="Buscar cliente"
          placeholder="Buscar por nombre o número de documento..."
          debounceMs={250}
          onSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
        />
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <FilterSelect
            label="Número de expediente"
            value={caseNumber}
            options={caseOptions}
            disabled={loading || Boolean(loadError)}
            onChange={(value) => {
              setCaseNumber(value);
              setCurrentPage(1);
            }}
          />
          <FilterSelect
            label="Radicado"
            value={filingNumber}
            options={filingOptions}
            disabled={loading || Boolean(loadError)}
            onChange={(value) => {
              setFilingNumber(value);
              setCurrentPage(1);
            }}
          />
          <button
            className="h-11 shrink-0 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
            disabled={!hasFilters}
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section
        aria-labelledby="client-records-title"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2
            id="client-records-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Directorio de clientes
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {loading
              ? "Cargando unidades económicas..."
              : `${numberFormatter.format(totalRecords)} registros encontrados`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                {[
                  "Cliente",
                  "Identificación",
                  "Expediente",
                  "Radicado",
                  "Estado",
                  "Responsable",
                  "Actividad más reciente",
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
                    colSpan={7}
                  >
                    Cargando unidades económicas...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-rose-700 dark:text-rose-300"
                    colSpan={7}
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
              ) : pageClients.length ? (
                pageClients.map((client) => (
                  <tr
                    key={client.id}
                    aria-label={`Ver perfil jurídico de ${client.name}`}
                    className="h-12 cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-sky-700 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800"
                    onClick={() =>
                      navigate(`/legal-management/clients/${client.id}`)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/legal-management/clients/${client.id}`);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                  >
                    <td className="h-12 whitespace-nowrap px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                      {client.name || "Nombre no especificado"}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {client.documentNumber || "No especificado"}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {client.caseNumber}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {client.filingNumber}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          client.status === "En curso"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                            : client.status === "Pendiente"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {client.responsible}
                    </td>
                    <td className="h-12 whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      <time dateTime={client.lastActivityAt}>
                        {dateFormatter.format(
                          new Date(`${client.lastActivityAt}T12:00:00`),
                        )}
                      </time>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-slate-500 dark:text-slate-300"
                    colSpan={7}
                  >
                    No hay clientes que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          aria-label="Paginación de clientes"
          className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700"
        >
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            Mostrar
            <select
              aria-label="Cantidad de clientes por página"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-800 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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

          <p
            aria-live="polite"
            className="text-sm text-slate-600 dark:text-slate-300"
          >
            Mostrando {numberFormatter.format(firstVisibleRecord)}–
            {numberFormatter.format(lastVisibleRecord)} de{" "}
            {numberFormatter.format(totalRecords)} clientes
          </p>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              disabled={currentPage <= 1 || loading || Boolean(loadError)}
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
              disabled={
                currentPage >= totalPages || loading || Boolean(loadError)
              }
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

export default LegalClients;
