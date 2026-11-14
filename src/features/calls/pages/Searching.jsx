import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { useAuth } from "../../../context/useAuth";
import { getProjects } from "../../projects/api/projects";
import ConvocatoriaCard from "../components/ConvocatoriaCard";
import FilterPanel from "../components/FilterPanel";
import { MatchingNotificationsPanel } from "../components/MatchingNotificationsPanel";
import { getProjectRecommendations } from "../api/matching";
import { canAccessSubsystem } from "../../../config/subsystems";
import { toAmount, toText, toTextList } from "../utils/callCard";

const projectPageSize = 100;
const recommendationPageSize = 20;

const emptyFilters = {
  impactArea: "",
  minAmount: "",
  maxAmount: "",
  closingBefore: "",
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

const toCallCard = (match) => ({
  id: match.fundingOpportunityId,
  titulo: match.title,
  organismoDonante: match.cooperatingEntity,
  ods: [],
  montoMaximo: match.maxAmount,
  fechaCierre: match.closingDate,
  enlaceOficial: match.sourceUrl,
  descripcion: match.requirementsDescription,
  areaImpacto: toText(match.impactArea),
  compatibilityScore: match.compatibilityScore,
  matchingJustification: match.nlpJustification,
  paisDonante: toText(match.donorCountry),
  tipoCooperacion: toText(match.cooperationType),
  tipoOrganizacion: toText(match.organizationType),
  tipoProyectos: toText(match.projectType),
  poblacionesObjetivo: toTextList(match.targetPopulations),
  formaPresentacion: toText(match.applicationMethod),
  idioma: toText(match.language),
  moneda: toText(match.currency),
  valorEnPesos: toAmount(match.amountInCop),
  portalOrigen: toText(match.sourcePage),
  documentoFuente: toText(match.sourceDocument),
  estado: toText(match.opportunityStatus),
  detalleEstado: toText(match.opportunityStatusDetail),
  contactoExterior: {
    persona: toText(match.contactPerson),
    telefono: toText(match.contactPhone),
    fax: toText(match.contactFax),
    direccion: toText(match.contactAddress),
    ciudad: toText(match.contactCity),
    email: toText(match.contactEmail),
  },
  contactoColombia: {
    persona: toText(match.localContactPerson),
    telefono: toText(match.localContactPhone),
    direccion: toText(match.localContactAddress),
    ciudad: toText(match.localContactCity),
    email: toText(match.localContactEmail),
  },
  observaciones: toText(match.notes),
});

const Searching = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectsPageResult, setProjectsPageResult] = useState(null);
  const [projectsPage, setProjectsPage] = useState(0);
  const [projectsRetryKey, setProjectsRetryKey] = useState(0);
  const [projectsRequest, setProjectsRequest] = useState({
    key: null,
    status: "loading",
  });
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [recommendationPage, setRecommendationPage] = useState(0);
  const [recommendationRetryKey, setRecommendationRetryKey] = useState(0);
  const [recommendationRequest, setRecommendationRequest] = useState({
    key: null,
    status: "idle",
  });

  const canAccessRecommendations = canAccessSubsystem(
    user?.role,
    "COOPERATION",
  );
  const projectsRequestKey = `${projectsPage}:${projectsRetryKey}`;
  const recommendationRequestKey = JSON.stringify([
    selectedProjectId,
    appliedFilters,
    recommendationPage,
    recommendationRetryKey,
  ]);

  useEffect(() => {
    if (!canAccessRecommendations) return undefined;

    const controller = new AbortController();

    getProjects({
      page: projectsPage,
      size: projectPageSize,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;

        setProjects((current) =>
          projectsPage === 0
            ? result.content
            : [
                ...current,
                ...result.content.filter(
                  (project) =>
                    !current.some(
                      (existingProject) => existingProject.id === project.id,
                    ),
                ),
              ],
        );
        setProjectsPageResult(result);
        setProjectsRequest({ key: projectsRequestKey, status: "success" });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setProjectsRequest({
            key: projectsRequestKey,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudieron cargar los proyectos.",
            ),
          });
        }
      });

    return () => controller.abort();
  }, [
    canAccessRecommendations,
    projectsPage,
    projectsRequestKey,
  ]);

  useEffect(() => {
    if (!canAccessRecommendations || !selectedProjectId) return undefined;

    const controller = new AbortController();

    getProjectRecommendations(selectedProjectId, {
      ...appliedFilters,
      page: recommendationPage,
      size: recommendationPageSize,
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) {
          setRecommendationRequest({
            key: recommendationRequestKey,
            status: "success",
            data: result,
          });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRecommendationRequest({
            key: recommendationRequestKey,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudieron cargar las convocatorias del proyecto.",
            ),
          });
        }
      });

    return () => controller.abort();
  }, [
    appliedFilters,
    canAccessRecommendations,
    recommendationPage,
    recommendationRequestKey,
    selectedProjectId,
  ]);

  const projectsLoading =
    projectsRequest.key !== projectsRequestKey ||
    projectsRequest.status === "loading";
  const projectsError =
    projectsRequest.key === projectsRequestKey &&
    projectsRequest.status === "error"
      ? projectsRequest.message
      : "";
  const recommendationsLoading =
    recommendationRequest.key !== recommendationRequestKey ||
    recommendationRequest.status === "loading";
  const recommendationsError =
    recommendationRequest.key === recommendationRequestKey &&
    recommendationRequest.status === "error"
      ? recommendationRequest.message
      : "";
  const recommendations =
    recommendationRequest.key === recommendationRequestKey &&
    recommendationRequest.status === "success"
      ? recommendationRequest.data
      : null;
  const callCards = useMemo(
    () => recommendations?.content.map(toCallCard) ?? [],
    [recommendations],
  );
  const selectedProject = projects.find(
    (project) => String(project.id) === selectedProjectId,
  );
  const hasAppliedFilters = Object.values(appliedFilters).some(Boolean);

  if (!canAccessRecommendations) {
    return (
      <section className="mx-auto grid max-w-3xl gap-3">
        <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Catálogo de convocatorias internacionales
        </h1>
        <EmptyState>
          Esta sección requiere acceso al Sistema de cooperación.
        </EmptyState>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="opportunity-catalog-title"
      className="mx-auto grid max-w-7xl gap-6"
    >
      <header className="grid gap-2">
        <h1
          className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
          id="opportunity-catalog-title"
        >
          Catálogo de convocatorias internacionales
        </h1>
        <p className="m-0 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Explora las oportunidades de financiación asociadas a un proyecto.
          La lista depende de las recomendaciones que el backend tenga
          registradas para ese proyecto.
        </p>
      </header>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label
          className="grid max-w-2xl gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
          htmlFor="catalog-project"
        >
          Proyecto
          <select
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            disabled={projectsLoading || projects.length === 0}
            id="catalog-project"
            value={selectedProjectId}
            onChange={(event) => {
              setSelectedProjectId(event.target.value);
              setRecommendationPage(0);
              setRecommendationRetryKey((key) => key + 1);
            }}
          >
            <option value="">
              {projectsLoading ? "Cargando proyectos..." : "Selecciona un proyecto"}
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.identifierCode} · {project.title}
              </option>
            ))}
          </select>
        </label>

        {projectsError && (
          <ErrorState
            message={projectsError}
            onRetry={() => {
              setProjectsPage(0);
              setProjects([]);
              setProjectsPageResult(null);
              setProjectsRetryKey((key) => key + 1);
            }}
          />
        )}

        {!projectsLoading && !projectsError && projects.length === 0 && (
          <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
            Aún no hay proyectos disponibles.{" "}
            <Link
              className="font-semibold text-emerald-800 underline underline-offset-2 dark:text-emerald-300"
              to="/cooperacion/proyectos/nuevo"
            >
              Crear proyecto
            </Link>
          </p>
        )}

        {!projectsLoading &&
          !projectsError &&
          projectsPageResult &&
          projectsPage + 1 < projectsPageResult.totalPages && (
            <button
              className="w-fit rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onClick={() => setProjectsPage((page) => page + 1)}
            >
              Cargar más proyectos
            </button>
          )}
      </section>

      {selectedProjectId && (
        <>
          {selectedProject && (
            <MatchingNotificationsPanel
              key={selectedProjectId}
              projectId={selectedProjectId}
              projectTitle={selectedProject.title}
            />
          )}

          <FilterPanel
            filters={filters}
            isLoading={recommendationsLoading}
            onChange={setFilters}
            onApply={(nextFilters) => {
              setAppliedFilters(nextFilters);
              setRecommendationPage(0);
            }}
          />

          <section aria-labelledby="catalog-results-title" className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2
                  className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100"
                  id="catalog-results-title"
                >
                  Convocatorias asociadas
                </h2>
                {recommendations && (
                  <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {new Intl.NumberFormat("es-CO").format(
                      recommendations.totalElements,
                    )}{" "}
                    {recommendations.totalElements === 1
                      ? "resultado"
                      : "resultados"}
                  </p>
                )}
              </div>
            </div>

            {recommendationsLoading && (
              <EmptyState>
                Cargando convocatorias asociadas al proyecto...
              </EmptyState>
            )}

            {!recommendationsLoading && recommendationsError && (
              <ErrorState
                message={recommendationsError}
                onRetry={() =>
                  setRecommendationRetryKey((key) => key + 1)
                }
              />
            )}

            {!recommendationsLoading &&
              !recommendationsError &&
              recommendations &&
              recommendations.totalElements === 0 && (
                <EmptyState>
                  {hasAppliedFilters
                    ? "No se encontraron convocatorias con los filtros seleccionados."
                    : "Este proyecto aún no tiene convocatorias asociadas."}
                </EmptyState>
              )}

            {!recommendationsLoading &&
              !recommendationsError &&
              callCards.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {callCards.map((call) => (
                    <ConvocatoriaCard
                      convocatoria={call}
                      key={call.id}
                    />
                  ))}
                </div>
              )}

            {!recommendationsLoading &&
              !recommendationsError &&
              recommendations &&
              recommendations.totalPages > 1 && (
                <nav
                  aria-label="Paginación de convocatorias"
                  className="flex flex-wrap items-center justify-between gap-3"
                >
                  <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
                    Página {recommendations.page + 1} de{" "}
                    {recommendations.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      disabled={recommendations.first}
                      type="button"
                      onClick={() =>
                        setRecommendationPage((page) => Math.max(0, page - 1))
                      }
                    >
                      Anterior
                    </button>
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      disabled={recommendations.last}
                      type="button"
                      onClick={() =>
                        setRecommendationPage((page) => page + 1)
                      }
                    >
                      Siguiente
                    </button>
                  </div>
                </nav>
              )}
          </section>
        </>
      )}
    </section>
  );
};

export default Searching;
