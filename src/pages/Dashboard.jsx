const PlaceholderCard = ({ title }) => (
  <article
    aria-label={`${title}: estadística próximamente disponible`}
    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
    <div aria-hidden="true" className="mt-4 h-8 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
    <div aria-hidden="true" className="mt-3 h-2 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
  </article>
);

const Dashboard = () => (
  <section
    aria-labelledby="dashboard-title"
    className="grid scroll-mt-24 gap-6"
  >
    <div className="grid gap-2">
      <h1 id="dashboard-title" className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Dashboard
      </h1>
      <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Aquí encontrarás el resumen estadístico de la información de la
        organización.
      </p>
    </div>

    <div
      aria-label="Estadísticas próximamente disponibles"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <PlaceholderCard title="Unidades económicas" />
      <PlaceholderCard title="Municipios" />
      <PlaceholderCard title="Nodos" />
      <PlaceholderCard title="Actividades económicas" />
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      {["Registros por actividad", "Registros por municipio"].map((title) => (
        <section
          key={title}
          aria-label={`${title}: gráfico próximamente disponible`}
          className="min-h-[250px] rounded-xl border border-slate-200 bg-white p-[22px] shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="m-0 text-base font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <div
            aria-hidden="true"
            className="mt-5 flex h-[140px] items-end gap-3 border-b border-slate-200 px-3 dark:border-slate-700"
          >
            <span className="h-[42%] w-[12%] rounded-t-md bg-sky-500/20 dark:bg-sky-400/35" />
            <span className="h-[68%] w-[12%] rounded-t-md bg-sky-500/20 dark:bg-sky-400/35" />
            <span className="h-[52%] w-[12%] rounded-t-md bg-sky-500/20 dark:bg-sky-400/35" />
            <span className="h-[84%] w-[12%] rounded-t-md bg-sky-500/20 dark:bg-sky-400/35" />
          </div>
          <p className="mt-4 text-[13px] text-slate-600 dark:text-slate-300">
            Estadísticas próximamente disponibles
          </p>
        </section>
      ))}
    </div>
  </section>
);

export default Dashboard;
