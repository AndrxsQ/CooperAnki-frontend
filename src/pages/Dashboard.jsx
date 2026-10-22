import { dashboardRecords } from "../data/dashboardData";

const numberFormatter = new Intl.NumberFormat("es-CO");

const countBy = (field) =>
  Object.entries(
    dashboardRecords.reduce((counts, record) => {
      const value = record[field] || "Sin especificar";
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((first, second) => second[1] - first[1]);

const municipalityCounts = countBy("municipality");
const nodeCounts = countBy("node");

const summaryCards = [
  {
    title: "Unidades económicas",
    value: dashboardRecords.length,
    description: "Registros cargados en los datos provisionales",
  },
  {
    title: "Municipios",
    value: municipalityCounts.length,
    description: "Municipios representados en los registros",
  },
  {
    title: "Nodos",
    value: nodeCounts.length,
    description: "Nodos con unidades económicas registradas",
  },
  {
    title: "Con correo electrónico",
    value: dashboardRecords.filter((record) => record.email).length,
    description: "Registros con correo disponible",
  },
];

const DistributionCard = ({ title, items }) => {
  const highestCount = items[0]?.[1] ?? 0;

  return (
    <section
      aria-label={title}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <h2 className="m-0 text-base font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <ul className="mt-5 grid list-none gap-4 p-0">
        {items.map(([label, count]) => (
          <li className="grid gap-1.5" key={label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-slate-700 dark:text-slate-200">
                {label}
              </span>
              <span className="shrink-0 font-semibold text-slate-900 dark:text-slate-100">
                {numberFormatter.format(count)}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <div
                className="h-full rounded-full bg-sky-600 dark:bg-sky-400"
                style={{
                  width: `${highestCount ? (count / highestCount) * 100 : 0}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

const Dashboard = () => (
  <section
    aria-labelledby="dashboard-title"
    className="grid scroll-mt-24 gap-6"
  >
    <div className="grid gap-2">
      <h1
        id="dashboard-title"
        className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
      >
        Dashboard
      </h1>
      <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Resumen de las unidades económicas incluidas en los datos provisionales.
      </p>
    </div>

    <div
      aria-label="Indicadores generales"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {summaryCards.map(({ title, value, description }) => (
        <article
          aria-label={`${title}: ${numberFormatter.format(value)}`}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          key={title}
        >
          <h2 className="m-0 text-sm font-medium text-slate-600 dark:text-slate-300">
            {title}
          </h2>
          <p className="mb-1 mt-3 text-3xl font-bold tracking-tight text-sky-800 dark:text-sky-300">
            {numberFormatter.format(value)}
          </p>
          <p className="m-0 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </article>
      ))}
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <DistributionCard
        title="Unidades económicas por municipio"
        items={municipalityCounts}
      />
      <DistributionCard
        title="Unidades económicas por nodo"
        items={nodeCounts}
      />
    </div>
  </section>
);

export default Dashboard;
