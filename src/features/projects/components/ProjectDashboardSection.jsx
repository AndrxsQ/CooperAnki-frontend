import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { useAuth } from "../../../context/useAuth";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { getProjects, projectStatuses } from "../api/projects";

const pageSize = 10;

const statusStyles = {
  DRAFT:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  IN_REVIEW:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  PUBLISHED:
    "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  FUNDED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
});

const statusLabel = (status) =>
  projectStatuses.find((item) => item.value === status)?.label ?? status;

const formatDate = (date) => {
  if (!date) return "Sin fecha";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "Fecha no disponible"
    : dateFormatter.format(parsedDate);
};

const SummaryCard = ({ label, value, description }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <h3 className="m-0 text-sm font-medium text-slate-600 dark:text-slate-300">
      {label}
    </h3>
    <p className="mb-1 mt-3 text-3xl font-bold tracking-tight text-sky-800 dark:text-sky-300">
      {value}
    </p>
    <p className="m-0 text-xs text-slate-500 dark:text-slate-400">
      {description}
    </p>
  </article>
);

const ProjectCard = ({ project }) => (
  <article className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
          {project.identifierCode}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[project.status] ?? statusStyles.DRAFT}`}
        >
          {statusLabel(project.status)}
        </span>
      </div>
      <h3 className="mb-0 mt-2 text-base font-bold text-slate-900 dark:text-slate-100">
        {project.title}
      </h3>
      <p className="mb-0 mt-1 text-sm text-slate-600 dark:text-slate-300">
        {project.organizationName || "Organización no disponible"}
      </p>
      {project.executiveSummary && (
        <p className="mb-0 mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {project.executiveSummary}
        </p>
      )}
      <Link
        className="mt-3 inline-flex w-fit text-sm font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-200"
        to={`/projects/${project.id}/edit`}
      >
        Editar propuesta
      </Link>
      <Link
        className="ml-4 inline-flex w-fit text-sm font-semibold text-sky-800 hover:text-sky-950 dark:text-sky-300 dark:hover:text-sky-200"
        to={`/projects/${project.id}/edit?section=attachments`}
      >
        Gestionar adjuntos
      </Link>
    </div>
    <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:min-w-48 sm:grid-cols-1">
      <div>
        <dt className="text-xs text-slate-500 dark:text-slate-400">
          Presupuesto solicitado
        </dt>
        <dd className="m-0 mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
          {project.requestedBudget == null
            ? "Sin especificar"
            : currencyFormatter.format(Number(project.requestedBudget))}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-slate-500 dark:text-slate-400">
          Fecha de cierre
        </dt>
        <dd className="m-0 mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
          {formatDate(project.closesAt)}
        </dd>
      </div>
    </dl>
  </article>
);

export const ProjectDashboardSection = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [projectResult, setProjectResult] = useState(null);
  const [projectRequest, setProjectRequest] = useState({
    key: null,
    status: "loading",
  });
  const [summary, setSummary] = useState(null);
  const [summaryRequest, setSummaryRequest] = useState({
    key: null,
    status: "loading",
  });

  const hasProjectAccess =
    user?.role === "ADMIN" &&
    user?.allowedSystems?.includes("COOPERA");
  const projectRequestKey = JSON.stringify([
    searchTerm,
    status,
    page,
    retryKey,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(query.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!hasProjectAccess) return undefined;
    const controller = new AbortController();

    getProjects({
      query: searchTerm,
      status,
      page,
      size: pageSize,
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) {
          setProjectResult(result);
          setProjectRequest({ key: projectRequestKey, status: "success" });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setProjectRequest({
            key: projectRequestKey,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudieron cargar los proyectos.",
            ),
          });
        }
      });

    return () => controller.abort();
  }, [hasProjectAccess, page, projectRequestKey, searchTerm, status]);

  useEffect(() => {
    if (!hasProjectAccess) return undefined;
    const controller = new AbortController();

    Promise.all(
      projectStatuses.map(async ({ value }) => {
        const result = await getProjects({
          status: value,
          page: 0,
          size: 1,
          signal: controller.signal,
        });
        return [value, result.totalElements];
      }),
    )
      .then((counts) => {
        if (!controller.signal.aborted) {
          setSummary(Object.fromEntries(counts));
          setSummaryRequest({ key: retryKey, status: "success" });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setSummaryRequest({
            key: retryKey,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudieron cargar los indicadores de proyectos.",
            ),
          });
        }
      });

    return () => controller.abort();
  }, [hasProjectAccess, retryKey]);

  const summaryCards = useMemo(() => {
    const counts = projectStatuses.map(({ value }) => [
      value,
      summary?.[value] ?? 0,
    ]);
    return [
      {
        label: "Proyectos registrados",
        value: counts.reduce((total, [, count]) => total + count, 0),
        description: "Total de proyectos en todos los estados",
      },
      ...counts.map(([value, count]) => ({
        label: statusLabel(value),
        value: count,
        description: "Proyectos en este estado",
      })),
    ];
  }, [summary]);

  const loading =
    projectRequest.key !== projectRequestKey ||
    projectRequest.status === "loading";
  const error =
    projectRequest.key === projectRequestKey &&
    projectRequest.status === "error"
      ? projectRequest.message
      : "";
  const summaryLoading =
    summaryRequest.key !== retryKey || summaryRequest.status === "loading";
  const summaryError =
    summaryRequest.key === retryKey && summaryRequest.status === "error"
      ? summaryRequest.message
      : "";
  const projects = projectResult?.content ?? [];
  const totalPages = projectResult?.totalPages ?? 0;
  const firstItem = projectResult?.totalElements
    ? page * pageSize + 1
    : 0;
  const lastItem = Math.min(
    (page + 1) * pageSize,
    projectResult?.totalElements ?? 0,
  );

  if (!hasProjectAccess) {
    return (
      <section aria-labelledby="projects-dashboard-title" className="grid gap-4">
        <header>
          <h2
            className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
            id="projects-dashboard-title"
          >
            Gestión de proyectos
          </h2>
        </header>
        <Alert title="Acceso restringido" variant="warning">
          El módulo de proyectos está disponible para cuentas ADMIN con acceso
          al sistema Coopera.
        </Alert>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="projects-dashboard-title"
      className="grid scroll-mt-24 gap-5"
    >
      <header className="grid gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <h2
              className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
              id="projects-dashboard-title"
            >
              Gestión de proyectos
            </h2>
            <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
              Consulta y filtra las propuestas socioeconómicas registradas.
            </p>
          </div>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-transparent bg-emerald-800 px-4 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            to="/projects/new"
          >
            Registrar propuesta
          </Link>
        </div>
      </header>

      {summaryError && (
        <Alert title="No se pudieron cargar los indicadores" variant="error">
          <div className="grid justify-items-start gap-3">
            <span>{summaryError}</span>
            <Button
              onClick={() => setRetryKey((current) => current + 1)}
              size="sm"
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      <div
        aria-label="Resumen de proyectos"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            {...card}
            value={summaryLoading ? "—" : card.value}
          />
        ))}
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-[minmax(0,1fr)_240px_auto] md:items-end">
        <label className="grid min-w-0 gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Buscar proyecto
          </span>
          <input
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            maxLength={255}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, código o descripción"
            type="search"
            value={query}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Estado
          </span>
          <select
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            value={status}
          >
            <option value="">Todos los estados</option>
            {projectStatuses.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Button
          onClick={() => {
            setQuery("");
            setSearchTerm("");
            setStatus("");
            setPage(0);
          }}
          variant="outline"
        >
          Limpiar filtros
        </Button>
      </div>

      {error ? (
        <Alert title="No se pudieron cargar los proyectos" variant="error">
          <div className="grid justify-items-start gap-3">
            <span>{error}</span>
            <Button
              onClick={() => setRetryKey((current) => current + 1)}
              size="sm"
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : loading ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          role="status"
        >
          Cargando proyectos...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          No hay proyectos que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {!loading && !error && projectResult && (
        <footer className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span>
            Mostrando {firstItem}–{lastItem} de {projectResult.totalElements}{" "}
            proyectos
          </span>
          <div className="flex items-center gap-2">
            <Button
              disabled={projectResult.first || loading}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              size="sm"
              variant="outline"
            >
              Anterior
            </Button>
            <span aria-live="polite">
              Página {page + 1} de {Math.max(totalPages, 1)}
            </span>
            <Button
              disabled={projectResult.last || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(Math.max(totalPages - 1, 0), current + 1),
                )
              }
              size="sm"
              variant="outline"
            >
              Siguiente
            </Button>
          </div>
        </footer>
      )}
    </section>
  );
};
