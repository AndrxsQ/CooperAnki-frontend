import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEconomicUnitById } from "../api/economicUnits";

const profileFields = [
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

const formatField = (record, key) => {
  const value = record[key];
  if (value === null || value === undefined || value === "") {
    return key === "age" ? "No especificada" : "No especificado";
  }
  return value;
};

const EconomicUnitProfile = () => {
  const { id } = useParams();
  const [request, setRequest] = useState({ key: null, status: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const requestKey = `${id}:${retryKey}`;

  useEffect(() => {
    const controller = new AbortController();

    getEconomicUnitById(id, controller.signal)
      .then((record) => {
        if (!controller.signal.aborted) {
          setRequest({ key: requestKey, status: "success", record });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({
            key: requestKey,
            status: error.response?.status === 404 ? "notFound" : "error",
            message:
              error.response?.data?.message ??
              error.message ??
              "No se pudo cargar la unidad económica.",
          });
        }
      });

    return () => controller.abort();
  }, [id, requestKey]);

  const loading =
    request.key !== requestKey || request.status === "loading";
  const record =
    request.key === requestKey && request.status === "success"
      ? request.record
      : null;
  const notFound = request.key === requestKey && request.status === "notFound";
  const loadError =
    request.key === requestKey && request.status === "error"
      ? request.message
      : "";

  if (loading) {
    return (
      <section className="grid scroll-mt-24 gap-6">
        <h1 className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Cargando unidad económica...
        </h1>
        <Link
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-sky-700 no-underline hover:underline dark:text-sky-300"
          to="/detailed-view"
        >
          Volver a Vista General
        </Link>
      </section>
    );
  }

  if (notFound || loadError || !record) {
    return (
      <section className="grid scroll-mt-24 gap-6">
        <div className="grid gap-2">
          <h1 className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {notFound
              ? "Unidad económica no encontrada"
              : "No se pudo cargar la unidad económica"}
          </h1>
          <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {notFound
              ? "No existe información para el perfil solicitado."
              : loadError}
          </p>
        </div>
        {!notFound && (
          <button
            className="w-fit rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Reintentar
          </button>
        )}
        <Link
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-sky-700 no-underline hover:underline dark:text-sky-300"
          to="/detailed-view"
        >
          Volver a Vista General
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="economic-unit-profile-title"
      className="grid scroll-mt-24 gap-6"
    >
      <Link
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-sky-700 no-underline hover:underline dark:text-sky-300"
        to="/detailed-view"
      >
        <span aria-hidden="true">←</span> Volver a Vista General
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-[22px] bg-sky-50 p-6 sm:p-8 dark:bg-slate-800">
          <div
            className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full bg-sky-700 text-[30px] font-bold text-white dark:bg-sky-500"
            aria-hidden="true"
          >
            {record.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="m-0 text-[11px] font-bold tracking-[0.12em] text-sky-700 dark:text-sky-300">
              PERFIL DE UNIDAD ECONÓMICA
            </p>
            <h1
              id="economic-unit-profile-title"
              className="my-1.5 text-[clamp(22px,3vw,30px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              {record.name || "Nombre no especificado"}
            </h1>
            <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
              {record.activity || "Sin actividades económicas registradas"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 border-y border-slate-200 px-6 py-4 text-[13px] font-semibold text-slate-600 sm:px-8 dark:border-slate-700 dark:text-slate-300">
          <span>{record.municipality || "Municipio no especificado"}</span>
          <span aria-hidden="true">·</span>
          <span>{record.node || "Nodo no especificado"}</span>
          <span aria-hidden="true">·</span>
          <span>{record.organization || "Organización no especificada"}</span>
        </div>

        <section
          aria-labelledby="economic-unit-details-title"
          className="p-6 sm:p-8"
        >
          <div>
            <h2
              id="economic-unit-details-title"
              className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Información relacionada
            </h2>
            <p className="mt-1.5 text-[13px] text-slate-600 dark:text-slate-300">
              Datos disponibles en el registro de esta unidad económica.
            </p>
          </div>
          <dl className="mt-[22px] grid grid-cols-1 gap-x-7 sm:grid-cols-2">
            {profileFields.map(({ key, label }) => (
              <div
                className="min-w-0 border-t border-slate-200 py-[15px] dark:border-slate-700"
                key={key}
              >
                <dt className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {label}
                </dt>
                <dd className="mt-1.5 wrap-anywhere text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatField(record, key)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </section>
    </section>
  );
};

export default EconomicUnitProfile;
