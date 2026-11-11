import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useToast } from "../../../context/useToast";
import { getOrganizations } from "../api/organizations";
import {
  createProject,
  getProjectById,
  updateProject,
} from "../api/projects";
import { projectSchema } from "../schemas/projectSchema";

const ProjectAttachmentsPanel = lazy(
  () => import("./ProjectAttachmentsPanel"),
);

const steps = [
  {
    title: "Identificación",
    description: "Organización, código y título de la propuesta.",
    fields: ["organizationId", "identifierCode", "title"],
  },
  {
    title: "Detalles y cronograma",
    description: "Resumen, presupuesto y fechas de ejecución.",
    fields: ["executiveSummary", "requestedBudget", "startsAt", "closesAt"],
  },
  {
    title: "Archivos adjuntos",
    description: "Carga y administra los documentos vinculados al proyecto.",
    fields: [],
  },
];

const emptyValues = {
  organizationId: "",
  identifierCode: "",
  title: "",
  executiveSummary: "",
  requestedBudget: "",
  startsAt: "",
  closesAt: "",
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toPayload = (values) => ({
  organizationId: Number(values.organizationId),
  identifierCode: values.identifierCode.trim(),
  title: values.title.trim(),
  executiveSummary: values.executiveSummary.trim() || null,
  requestedBudget: values.requestedBudget
    ? Number(values.requestedBudget)
    : null,
  startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
  closesAt: values.closesAt ? new Date(values.closesAt).toISOString() : null,
});

export const ProjectWizard = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [step, setStep] = useState(() =>
    isEditing && searchParams.get("section") === "attachments" ? 2 : 0,
  );
  const [savedProjectId, setSavedProjectId] = useState(id ?? null);
  const [organizations, setOrganizations] = useState([]);
  const [organizationsState, setOrganizationsState] = useState({
    key: null,
    status: "loading",
  });
  const [projectState, setProjectState] = useState({
    key: null,
    status: isEditing ? "loading" : "success",
  });
  const [retryKey, setRetryKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    mode: "onTouched",
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (step === 2) return undefined;
    const controller = new AbortController();
    getOrganizations(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setOrganizations(items);
          setOrganizationsState({ key: retryKey, status: "success" });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setOrganizationsState({
            key: retryKey,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudieron cargar las organizaciones.",
            ),
          });
        }
      });
    return () => controller.abort();
  }, [retryKey, step]);

  useEffect(() => {
    if (!isEditing || step === 2) return undefined;
    const controller = new AbortController();
    getProjectById(id, controller.signal)
      .then((project) => {
        if (!controller.signal.aborted) {
          reset({
            organizationId: String(project.organizationId),
            identifierCode: project.identifierCode,
            title: project.title,
            executiveSummary: project.executiveSummary ?? "",
            requestedBudget:
              project.requestedBudget == null
                ? ""
                : String(project.requestedBudget),
            startsAt: toDateTimeLocal(project.startsAt),
            closesAt: toDateTimeLocal(project.closesAt),
          });
          setProjectState({ key: id, status: "success" });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setProjectState({
            key: id,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudo cargar el proyecto para editarlo.",
            ),
          });
        }
      });
    return () => controller.abort();
  }, [id, isEditing, reset, step]);

  const loadingOrganizations =
    organizationsState.key !== retryKey ||
    organizationsState.status === "loading";
  const organizationError =
    organizationsState.key === retryKey &&
    organizationsState.status === "error"
      ? organizationsState.message
      : "";
  const loadingProject =
    isEditing &&
    step !== 2 &&
    (projectState.key !== id || projectState.status === "loading");
  const projectError =
    isEditing && projectState.key === id && projectState.status === "error"
      ? projectState.message
      : "";

  const goToNextStep = async () => {
    const valid = await trigger(steps[step].fields, { shouldFocus: true });
    if (valid) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const onSubmit = async (values) => {
    try {
      const payload = toPayload(values);
      const project = isEditing
        ? await updateProject(id, payload)
        : await createProject(payload);
      setSavedProjectId(String(project.id));
      setStep(2);
      addToast({
        message: isEditing
          ? "El proyecto se guardó. Puedes gestionar sus adjuntos."
          : "El proyecto se creó. Ahora puedes agregar sus adjuntos.",
        variant: "success",
      });
    } catch (error) {
      const fieldErrors = error?.fieldErrors ?? error?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (steps.some((item) => item.fields.includes(field)) && typeof message === "string") {
            setError(field, { type: "server", message });
          }
        });
      }

      if (!error?.isAxiosError) {
        addToast({
          message: getUserFacingErrorMessage(
            error,
            "No se pudo guardar el proyecto.",
          ),
        });
      }
    }
  };

  return (
    <section
      aria-labelledby="project-wizard-title"
      className="mx-auto grid w-full max-w-3xl gap-6"
    >
      <header className="grid gap-2">
        <Link
          className="w-fit text-sm font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-200"
          to="/cooperacion"
        >
          ← Volver al dashboard
        </Link>
        <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
          Gestión de proyectos
        </p>
        <h1
          className="m-0 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
          id="project-wizard-title"
        >
          {isEditing ? "Editar propuesta" : "Registrar propuesta"}
        </h1>
      </header>

      <ol
        aria-label="Pasos del formulario"
        className="grid list-none gap-3 p-0 sm:grid-cols-2"
      >
        {steps.map((item, index) => (
          <li
            aria-current={step === index ? "step" : undefined}
            className={`rounded-xl border p-4 ${
              step === index
                ? "border-emerald-700 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
                : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            }`}
            key={item.title}
          >
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Paso {index + 1}
            </p>
            <p className="mb-1 mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {item.title}
            </p>
            <p className="m-0 text-xs text-slate-600 dark:text-slate-300">
              {item.description}
            </p>
          </li>
        ))}
      </ol>

      {organizationError && (
        <Alert title="No se pudieron cargar las organizaciones" variant="error">
          <div className="grid justify-items-start gap-3">
            <span>{organizationError}</span>
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
      {projectError && (
        <Alert title="No se pudo cargar el proyecto" variant="error">
          {projectError}
        </Alert>
      )}

      {loadingProject ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Cargando proyecto...
        </div>
      ) : !projectError && (
        step === 2 ? (
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900">
            {savedProjectId ? (
              <Suspense
                fallback={
                  <div
                    aria-live="polite"
                    className="py-8 text-center text-sm text-slate-600 dark:text-slate-300"
                    role="status"
                  >
                    Cargando gestor de adjuntos...
                  </div>
                }
              >
                <ProjectAttachmentsPanel projectId={savedProjectId} />
              </Suspense>
            ) : (
              <Alert title="Guarda la propuesta primero" variant="info">
                Los archivos se vinculan a una propuesta guardada. Vuelve al
                paso anterior y guarda los datos para continuar.
              </Alert>
            )}
            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
              <Button
                onClick={() => setStep(1)}
                type="button"
                variant="outline"
              >
                Volver a los detalles
              </Button>
              <Button
                onClick={() =>
                  navigate("/cooperacion", {
                    replace: true,
                    state: { projectId: savedProjectId },
                  })
                }
                type="button"
              >
                Finalizar
              </Button>
            </div>
          </div>
        ) : (
        <form
          className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div aria-live="polite">
            <h2 className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100">
              {steps[step].title}
            </h2>
            <p className="mb-0 mt-1 text-sm text-slate-600 dark:text-slate-300">
              {steps[step].description}
            </p>
          </div>

          {step === 0 ? (
            <div className="grid gap-5">
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Organización
                </span>
                <select
                  aria-invalid={Boolean(errors.organizationId)}
                  className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100 ${
                    errors.organizationId
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 focus:border-emerald-700 focus:ring-emerald-700/15 dark:border-slate-700"
                  }`}
                  disabled={
                    loadingOrganizations ||
                    organizationsState.status !== "success" ||
                    organizations.length === 0 ||
                    isSubmitting
                  }
                  {...register("organizationId")}
                >
                  <option value="">
                    {loadingOrganizations
                      ? "Cargando organizaciones..."
                      : organizations.length
                        ? "Selecciona una organización"
                        : "No hay organizaciones disponibles"}
                  </option>
                  {organizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                      {organization.location
                        ? ` — ${organization.location}`
                        : ""}
                    </option>
                  ))}
                </select>
                {errors.organizationId && (
                  <span className="text-xs text-rose-700 dark:text-rose-300">
                    {errors.organizationId.message}
                  </span>
                )}
              </label>
              <Input
                disabled={isSubmitting}
                error={errors.identifierCode?.message}
                hint="Debe ser único y tener máximo 50 caracteres."
                label="Código de la propuesta"
                maxLength={50}
                placeholder="Ej. PROY-2026-001"
                {...register("identifierCode")}
              />
              <Input
                disabled={isSubmitting}
                error={errors.title?.message}
                label="Título"
                maxLength={255}
                placeholder="Nombre de la propuesta territorial"
                {...register("title")}
              />
            </div>
          ) : (
            <div className="grid gap-5">
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Resumen ejecutivo
                </span>
                <textarea
                  className="min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  maxLength={10000}
                  placeholder="Describe brevemente el propósito y alcance del proyecto."
                  {...register("executiveSummary")}
                />
                {errors.executiveSummary && (
                  <span className="text-xs text-rose-700 dark:text-rose-300">
                    {errors.executiveSummary.message}
                  </span>
                )}
              </label>
              <Input
                disabled={isSubmitting}
                error={errors.requestedBudget?.message}
                hint="Opcional. Ingresa el monto en pesos colombianos."
                label="Presupuesto solicitado (COP)"
                min="0.01"
                step="0.01"
                type="number"
                {...register("requestedBudget")}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  disabled={isSubmitting}
                  error={errors.startsAt?.message}
                  label="Fecha de inicio (opcional)"
                  type="datetime-local"
                  {...register("startsAt")}
                />
                <Input
                  disabled={isSubmitting}
                  error={errors.closesAt?.message}
                  label="Fecha de cierre (opcional)"
                  type="datetime-local"
                  {...register("closesAt")}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
            <Button
              disabled={step === 0 || isSubmitting}
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              type="button"
              variant="outline"
            >
              Anterior
            </Button>
            {step === 0 ? (
              <Button
                disabled={isSubmitting || loadingOrganizations}
                onClick={goToNextStep}
                type="button"
              >
                Continuar
              </Button>
            ) : (
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar y gestionar adjuntos"
                    : "Crear y gestionar adjuntos"}
              </Button>
            )}
          </div>
        </form>
        )
      )}
    </section>
  );
};
