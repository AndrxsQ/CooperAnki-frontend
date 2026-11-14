import { useEffect, useMemo, useState } from "react";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { useAuth } from "../../../context/useAuth";
import { canAccessSubsystem } from "../../../config/subsystems";
import CatalogFilterPanel from "../components/CatalogFilterPanel";
import ConvocatoriaCard from "../components/ConvocatoriaCard";
import { getFundingOpportunities } from "../api/catalog";
import { toCallCardFromOpportunity } from "../utils/callCard";

const catalogPageSize = 20;

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

const EmptyState = ({ children }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
      {children}
    </p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div
    className="rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/40"
    role="alert"
  >
    <p className="m-0 text-sm text-rose-800 dark:text-rose-200">{message}</p>
    <button
      className="mt-3 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/50"
      type="button"
      onClick={onRetry}
    >
      Reintentar
    </button>
  </div>
);

const ConvocatoriasCatalog = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [page, setPage] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [request, setRequest] = useState({ key: null, status: "loading" });

  const canAccessCatalog = canAccessSubsystem(user?.role, "COOPERATION");
  const requestKey = JSON.stringify([appliedFilters, page, retryKey]);

  useEffect(() => {
    if (!canAccessCatalog) return undefined;

    const controller = new AbortController();

    getFundingOpportunities({
      ...appliedFilters,
      page,
      size: catalogPageSize,
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) {
          setRequest({ key: requestKey, status: "success", data: result });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({
            key: requestKey,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudo cargar el catálogo de convocatorias.",
            ),
          });
        }
      });

    return () => controller.abort();
  }, [appliedFilters, canAccessCatalog, page, requestKey]);

  const isLoading = request.key !== requestKey || request.status === "loading";
  const loadError =
    request.key === requestKey && request.status === "error"
      ? request.message
      : "";
  const catalog =
    request.key === requestKey && request.status === "success"
      ? request.data
      : null;
  const callCards = useMemo(
    () => catalog?.content.map(toCallCardFromOpportunity) ?? [],
    [catalog],
  );
  const hasAppliedFilters = Object.values(appliedFilters).some(Boolean);

  if (!canAccessCatalog) {
    return (
      <section className="mx-auto grid max-w-3xl gap-3">
        <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Catálogo de convocatorias
        </h1>
        <EmptyState>
          Esta sección requiere acceso al Sistema de cooperación.
        </EmptyState>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="funding-catalog-title"
      className="mx-auto grid max-w-7xl gap-6"
    >
      <header className="grid gap-2">
        <h1
          className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
          id="funding-catalog-title"
        >
          Catálogo de convocatorias
        </h1>
        <p className="m-0 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Consulta todas las convocatorias registradas, sin necesidad de
          seleccionar un proyecto. Usa los filtros para acotar la búsqueda por
          área de impacto, país del donante, moneda, monto o fecha de cierre.
        </p>
      </header>

      <CatalogFilterPanel
        filters={filters}
        isLoading={isLoading}
        onChange={setFilters}
        onApply={(nextFilters) => {
          setAppliedFilters(nextFilters);
          setPage(0);
        }}
      />

      <section aria-labelledby="funding-catalog-results-title" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100"
              id="funding-catalog-results-title"
            >
              Convocatorias
            </h2>
            {catalog && (
              <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
                {new Intl.NumberFormat("es-CO").format(catalog.totalElements)}{" "}
                {catalog.totalElements === 1 ? "resultado" : "resultados"}
              </p>
            )}
          </div>
        </div>

        {isLoading && (
          <EmptyState>Cargando convocatorias del catálogo...</EmptyState>
        )}

        {!isLoading && loadError && (
          <ErrorState
            message={loadError}
            onRetry={() => setRetryKey((key) => key + 1)}
          />
        )}

        {!isLoading &&
          !loadError &&
          catalog &&
          catalog.totalElements === 0 && (
            <EmptyState>
              {hasAppliedFilters
                ? "No se encontraron convocatorias con los filtros seleccionados."
                : "Aún no hay convocatorias registradas en el catálogo."}
            </EmptyState>
          )}

        {!isLoading && !loadError && callCards.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {callCards.map((call) => (
              <ConvocatoriaCard convocatoria={call} key={call.id} />
            ))}
          </div>
        )}

        {!isLoading && !loadError && catalog && catalog.totalPages > 1 && (
          <nav
            aria-label="Paginación del catálogo de convocatorias"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
              Página {catalog.page + 1} de {catalog.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={catalog.first}
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Anterior
              </button>
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={catalog.last}
                type="button"
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente
              </button>
            </div>
          </nav>
        )}
      </section>
    </section>
  );
};

export default ConvocatoriasCatalog;
