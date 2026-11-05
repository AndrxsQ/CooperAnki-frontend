import { Link } from "react-router-dom";

const territorialFields = [
  { key: "documentNumber", label: "Número de documento" },
  { key: "age", label: "Edad" },
  { key: "department", label: "Departamento" },
  { key: "municipality", label: "Municipio" },
  { key: "node", label: "Nodo" },
  { key: "activity", label: "Actividad económica" },
  { key: "organization", label: "Organización" },
  { key: "address", label: "Dirección" },
  { key: "phone", label: "Teléfono" },
  { key: "email", label: "Correo electrónico" },
];

const legalFields = [
  { key: "documentNumber", label: "Identificación del cliente" },
  { key: "caseNumber", label: "Número de expediente" },
  { key: "filingNumber", label: "Radicado" },
  { key: "status", label: "Estado del expediente" },
  { key: "responsible", label: "Responsable" },
  { key: "lastActivityAt", label: "Actividad más reciente", type: "date" },
];

const formatValue = (record, key) => {
  const value = record[key];
  if (value === null || value === undefined || value === "") {
    return key === "age" ? "No especificada" : "No especificado";
  }
  if (key === "lastActivityAt") {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  }
  return value;
};

const EconomicUnitProfileView = ({ record, mode, backTo }) => {
  const isLegal = mode === "legal";
  const fields = isLegal ? legalFields : territorialFields;
  const switchTo = isLegal
    ? `/economic-units/${encodeURIComponent(record.id)}`
    : `/legal-management/clients/${encodeURIComponent(record.id)}`;

  return (
    <section
      aria-labelledby="economic-unit-profile-title"
      className="grid scroll-mt-24 gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-sky-700 no-underline hover:underline dark:text-sky-300"
          to={backTo}
        >
          <span aria-hidden="true">←</span>
          {isLegal ? "Volver a Clientes" : "Volver a Vista General"}
        </Link>
        <Link
          aria-label={
            isLegal
              ? "Cambiar a datos territoriales"
              : "Cambiar a información jurídica"
          }
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-800 no-underline transition hover:border-sky-400 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:border-sky-700 dark:hover:bg-sky-900/60"
          to={switchTo}
        >
          {isLegal ? "Ver datos territoriales" : "Ver información jurídica"}
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-5 bg-sky-50 p-6 sm:p-8 dark:bg-slate-800">
          <div
            className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-sky-700 text-[28px] font-bold text-white dark:bg-sky-500"
            aria-hidden="true"
          >
            {record.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-bold tracking-[0.12em] text-sky-700 dark:text-sky-300">
              {isLegal
                ? "PERFIL JURÍDICO DEL CLIENTE"
                : "PERFIL DE UNIDAD ECONÓMICA"}
            </p>
            <h1
              id="economic-unit-profile-title"
              className="my-1.5 text-[clamp(22px,3vw,30px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              {record.name || "Nombre no especificado"}
            </h1>
            <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
              {isLegal
                ? record.documentNumber || "Identificación no especificada"
                : record.activity || "Sin actividades económicas registradas"}
            </p>
          </div>
        </div>

        {!isLegal && (
          <div className="flex flex-wrap gap-2.5 border-y border-slate-200 px-6 py-4 text-[13px] font-semibold text-slate-600 sm:px-8 dark:border-slate-700 dark:text-slate-300">
            <span>{record.municipality || "Municipio no especificado"}</span>
            <span aria-hidden="true">·</span>
            <span>{record.node || "Nodo no especificado"}</span>
            <span aria-hidden="true">·</span>
            <span>{record.organization || "Organización no especificada"}</span>
          </div>
        )}

        <section
          aria-labelledby="economic-unit-details-title"
          className="p-6 sm:p-8"
        >
          <div>
            <h2
              id="economic-unit-details-title"
              className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {isLegal ? "Información jurídica" : "Información relacionada"}
            </h2>
            <p className="mt-1.5 text-[13px] text-slate-600 dark:text-slate-300">
              {isLegal
                ? "Datos jurídicos asociados al cliente."
                : "Datos disponibles en el registro de esta unidad económica."}
            </p>
          </div>
          <dl className="mt-[22px] grid grid-cols-1 gap-x-7 sm:grid-cols-2">
            {fields.map(({ key, label }) => (
              <div
                className="min-w-0 border-t border-slate-200 py-[15px] dark:border-slate-700"
                key={key}
              >
                <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {label}
                </dt>
                <dd className="mt-1.5 wrap-anywhere text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatValue(record, key)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </section>
    </section>
  );
};

export default EconomicUnitProfileView;
