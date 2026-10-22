import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEconomicUnits } from "../api/economicUnits";

const numberFormatter = new Intl.NumberFormat("es-CO");
const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const sampleTasks = [
  {
    id: "task-01",
    title: "Revisar documentación del expediente",
    detail: "Prioridad alta · Hoy",
    status: "Pendiente",
  },
  {
    id: "task-02",
    title: "Preparar seguimiento de actuaciones",
    detail: "Prioridad media · Esta semana",
    status: "En curso",
  },
];

const sampleAppointments = [
  {
    id: "appointment-01",
    date: "2026-10-24",
    time: "09:00",
    title: "Revisión de plazos procesales",
    context: "Agenda de demostración",
  },
  {
    id: "appointment-02",
    date: "2026-10-27",
    time: "14:30",
    title: "Seguimiento de expediente",
    context: "Agenda de demostración",
  },
];

const StatCard = ({ label, value, detail, tone = "sky" }) => {
  const tones = {
    sky: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40",
    emerald:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
    amber:
      "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    violet:
      "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30",
  };

  return (
    <article className={`rounded-xl border p-5 shadow-sm ${tones[tone]}`}>
      <p className="m-0 text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </p>
      <p className="mb-1 mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="m-0 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </article>
  );
};

const SectionHeading = ({ title, link, to }) => (
  <div className="flex flex-wrap items-center justify-between gap-2">
    <h2 className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100">
      {title}
    </h2>
    {link && (
      <Link
        className="text-sm font-semibold text-sky-700 no-underline hover:underline dark:text-sky-300"
        to={to}
      >
        {link}
      </Link>
    )}
  </div>
);

const LegalHome = () => {
  const [clients, setClients] = useState([]);
  const [request, setRequest] = useState({ key: null, status: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getEconomicUnits(controller.signal)
      .then(({ units }) => {
        if (!controller.signal.aborted) {
          const sortedUnits = [...units].sort((first, second) =>
            String(first.name ?? "").localeCompare(
              String(second.name ?? ""),
              "es",
            ),
          );
          setClients(sortedUnits);
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

  return (
    <section
      aria-labelledby="legal-home-title"
      className="grid scroll-mt-24 gap-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
            LEXGESTIÓN · Panel del despacho
          </p>
          <h1
            id="legal-home-title"
            className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Panel general
          </h1>
          <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Resumen de clientes, asuntos y trabajo pendiente del despacho.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white no-underline transition hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          to="/legal-management/clients"
        >
          Ir a Clientes
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clientes registrados"
          value={loading ? "…" : loadError ? "—" : numberFormatter.format(clients.length)}
          detail="Unidades económicas del registro"
          tone="sky"
        />
        <StatCard
          label="Expedientes abiertos"
          value="4"
          detail="Indicador de demostración"
          tone="emerald"
        />
        <StatCard
          label="Tareas pendientes"
          value="2"
          detail="Indicador de demostración"
          tone="amber"
        />
        <StatCard
          label="Saldo pendiente"
          value={currencyFormatter.format(1650000)}
          detail="Valor ilustrativo · no representa cobros"
          tone="violet"
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <SectionHeading
            title="Acceso rápido a clientes"
            link="Ver todos"
            to="/legal-management/clients"
          />
          {loading ? (
            <p className="m-0 py-5 text-sm text-slate-500 dark:text-slate-400">
              Cargando clientes…
            </p>
          ) : loadError ? (
            <div className="grid justify-items-start gap-3 py-3">
              <p className="m-0 text-sm text-rose-700 dark:text-rose-300">
                {loadError}
              </p>
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                type="button"
                onClick={() => setRetryKey((key) => key + 1)}
              >
                Reintentar
              </button>
            </div>
          ) : clients.length ? (
            <ul className="m-0 grid list-none gap-2 p-0">
              {clients.slice(0, 5).map((client) => (
                <li key={client.id}>
                  <Link
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 px-4 py-3 no-underline transition hover:border-sky-200 hover:bg-sky-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                    to="/legal-management/clients"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {client.name || "Nombre no especificado"}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                        {client.municipality || "Municipio no especificado"}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {client.documentNumber || "Sin documento"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 py-5 text-sm text-slate-500 dark:text-slate-400">
              No hay clientes registrados.
            </p>
          )}
        </section>

        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <SectionHeading
            title="Tareas pendientes"
            link="Ir a Expedientes"
            to="/legal-management/cases"
          />
          <p className="m-0 -mt-2 text-xs text-slate-500 dark:text-slate-400">
            Actividades de demostración
          </p>
          <ul className="m-0 grid list-none gap-3 p-0">
            {sampleTasks.map((task) => (
              <li
                className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                key={task.id}
              >
                <div>
                  <p className="m-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {task.title}
                  </p>
                  <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {task.detail}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  {task.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <SectionHeading title="Próximas fechas" />
        <p className="m-0 -mt-2 text-xs text-slate-500 dark:text-slate-400">
          Agenda de demostración
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {sampleAppointments.map((appointment) => (
            <article
              className="flex items-center gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800"
              key={appointment.id}
            >
              <time
                className="grid min-w-[62px] justify-items-center rounded-lg bg-white px-2 py-2 text-center shadow-sm dark:bg-slate-900"
                dateTime={`${appointment.date}T${appointment.time}`}
              >
                <span className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-300">
                  {new Intl.DateTimeFormat("es-CO", { month: "short" }).format(
                    new Date(`${appointment.date}T12:00:00`),
                  )}
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {new Date(`${appointment.date}T12:00:00`).getDate()}
                </span>
              </time>
              <div>
                <p className="m-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {appointment.title}
                </p>
                <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {appointment.time} · {appointment.context}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {[
          ["Clientes", "/legal-management/clients"],
          ["Expedientes", "/legal-management/cases"],
        ].map(([label, to]) => (
          <Link
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 no-underline transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-700 dark:hover:bg-slate-800"
            key={to}
            to={to}
          >
            Abrir {label} →
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LegalHome;
