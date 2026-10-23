import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EconomicUnitProfileView from "../components/EconomicUnitProfileView";
import { getEconomicUnitById, getEconomicUnits } from "../api/economicUnits";
import { createTemporaryLegalClients } from "../data/legalClientData";

const EconomicUnitProfile = ({ mode = "territorial" }) => {
  const { id } = useParams();
  const [request, setRequest] = useState({ key: null, status: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const requestKey = `${id}:${mode}:${retryKey}`;
  const backTo =
    mode === "legal" ? "/legal-management/clients" : "/detailed-view";

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        let record;
        if (mode === "legal") {
          const { units } = await getEconomicUnits(controller.signal);
          record = createTemporaryLegalClients(units).find(
            (client) => String(client.id) === String(id),
          );
          if (!record) {
            const error = new Error(
              "No existe información para el perfil solicitado.",
            );
            error.status = 404;
            throw error;
          }
        } else {
          record = await getEconomicUnitById(id, controller.signal);
        }

        if (!controller.signal.aborted) {
          setRequest({ key: requestKey, status: "success", record });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setRequest({
            key: requestKey,
            status:
              error.response?.status === 404 || error.status === 404
                ? "notFound"
                : "error",
            message:
              error.response?.data?.message ??
              error.message ??
              "No se pudo cargar la información del cliente.",
          });
        }
      }
    };

    loadProfile();
    return () => controller.abort();
  }, [id, mode, requestKey]);

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
          Cargando perfil...
        </h1>
        <Link
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-sky-700 no-underline hover:underline dark:text-sky-300"
          to={backTo}
        >
          Volver
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
              ? "Cliente no encontrado"
              : "No se pudo cargar el perfil"}
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
          to={backTo}
        >
          Volver
        </Link>
      </section>
    );
  }

  return (
    <EconomicUnitProfileView
      record={record}
      mode={mode}
      backTo={backTo}
    />
  );
};

export default EconomicUnitProfile;
