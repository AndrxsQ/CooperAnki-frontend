import { Link } from "react-router-dom";

const workAreas = [
  {
    title: "Clientes",
    description: "Consulta el directorio de unidades económicas.",
    to: "/legal-management/clients",
    action: "Abrir clientes",
  },
  {
    title: "Expedientes",
    description: "Explora la clasificación de asuntos jurídicos.",
    to: "/legal-management/cases",
    action: "Abrir expedientes",
  },
];

const plannedAreas = [
  "Seguimiento",
  "Tareas",
  "Agenda",
  "Documentos",
  "Comunicaciones",
  "Informes",
];

const LegalHome = () => (
  <section
    aria-labelledby="legal-home-title"
    className="grid scroll-mt-24 gap-8"
  >
    <header className="grid gap-2">
      <h1
        id="legal-home-title"
        className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
      >
        Panel del despacho
      </h1>
      <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Accede a las áreas de trabajo de Gestión Jurídica desde un solo lugar.
      </p>
    </header>

    <section aria-labelledby="work-areas-title" className="grid gap-4">
      <h2
        id="work-areas-title"
        className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100"
      >
        Áreas de trabajo
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {workAreas.map((area) => (
          <Link
            className="group grid min-h-44 content-between gap-6 rounded-xl border border-slate-200 bg-white p-5 text-left no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-700"
            key={area.to}
            to={area.to}
          >
            <div className="grid gap-2">
              <h3 className="m-0 text-lg font-bold text-slate-900 group-hover:text-sky-800 dark:text-slate-100 dark:group-hover:text-sky-300">
                {area.title}
              </h3>
              <p className="m-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {area.description}
              </p>
            </div>
            <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">
              {area.action} →
            </span>
          </Link>
        ))}
      </div>
    </section>

    <section
      aria-labelledby="planned-areas-title"
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="grid gap-1">
        <h2
          id="planned-areas-title"
          className="m-0 text-base font-bold text-slate-900 dark:text-slate-100"
        >
          Módulos previstos
        </h2>
        <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
          Estas áreas se habilitarán conforme avance el desarrollo.
        </p>
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {plannedAreas.map((area) => (
          <li
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            key={area}
          >
            {area}
          </li>
        ))}
      </ul>
    </section>
  </section>
);

export default LegalHome;
