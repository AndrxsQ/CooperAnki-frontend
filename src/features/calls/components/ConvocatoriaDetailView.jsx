import { useEffect, useRef, useState } from "react";
import { getOdsGoal } from "../data/ods";

const cleanText = (value) => {
  if (!value) return "";
  const parsed = new DOMParser().parseFromString(String(value), "text/html");
  return parsed.body.textContent?.trim() || "";
};

const renderTextList = (value) => {
  const text = cleanText(value);
  if (!text) return <p className="text-sm text-slate-500">No especificado.</p>;

  const items = text
    .split(/\r?\n|•/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length > 1) {
    return (
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
      </ul>
    );
  }
  return <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{text}</p>;
};

const ConvocatoriaDetailView = ({
  convocatoria,
  isFavorite,
  onClose,
  onSuggest,
  onToggleFavorite,
}) => {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [copyMessage, setCopyMessage] = useState("");
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const externalUrl = (() => {
    try {
      const url = new URL(convocatoria.enlaceOficial);
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    dialog.showModal();
    const handleClose = () => onCloseRef.current();
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) dialog.close();
    };
  }, []);

  const copyOfficialLink = async () => {
    if (!externalUrl) {
      setCopyMessage("No hay un enlace oficial válido para copiar.");
      return;
    }
    try {
      await navigator.clipboard.writeText(externalUrl);
      setCopyMessage("Enlace copiado.");
    } catch {
      setCopyMessage("No se pudo copiar. Puedes abrir el enlace oficial para copiarlo.");
    }
  };

  const suggestForProject = () => {
    if (!onSuggest) {
      setSuggestionMessage("La sugerencia requiere conectar esta acción con un proyecto.");
      return;
    }
    onSuggest(convocatoria);
    setSuggestionMessage("Convocatoria sugerida para el proyecto.");
  };

  const ods = (convocatoria.ods || [])
    .map((goalId) => getOdsGoal(goalId))
    .filter(Boolean);

  return (
    <dialog
      aria-labelledby="convocatoria-detail-title"
      className="m-auto max-h-[90vh] w-[min(720px,calc(100%-2rem))] overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-slate-950/50"
      ref={dialogRef}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              {convocatoria.organismoDonante || "Organismo no especificado"}
            </p>
            <h2
              className="mt-1 text-xl font-bold leading-snug text-slate-900"
              id="convocatoria-detail-title"
            >
              {convocatoria.titulo || "Convocatoria sin título"}
            </h2>
          </div>
          <button
            aria-label="Cerrar detalle"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            type="button"
            onClick={onClose}
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {ods.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="ODS impactados">
              {ods.map((goal) => (
                <span
                  key={goal.id}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: goal.color }}
                >
                  ODS {goal.id}: {goal.name}
                </span>
              ))}
            </div>
          )}

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Descripción</h3>
            {renderTextList(convocatoria.descripcion)}
          </section>
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Bases técnicas</h3>
            {renderTextList(convocatoria.basesTecnicas)}
          </section>
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Criterios de elegibilidad
            </h3>
            {renderTextList(convocatoria.criteriosElegibilidad)}
          </section>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Monto máximo ofertado</p>
            <p className="mt-1 font-semibold text-slate-900">
              {convocatoria.montoMaximo === null || convocatoria.montoMaximo === undefined
                ? "No especificado"
                : new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: convocatoria.moneda || "COP",
                  maximumFractionDigits: 0,
                }).format(Number(convocatoria.montoMaximo))}
            </p>
          </div>

          {externalUrl ? (
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950"
              href={externalUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Abrir plataforma oficial del cooperante
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 4h6v6m-11 4L20 4M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
              </svg>
            </a>
          ) : (
            <p className="text-sm text-slate-500">Enlace oficial no disponible.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            type="button"
            onClick={copyOfficialLink}
          >
            Copiar enlace
          </button>
          <button
            aria-pressed={isFavorite}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            type="button"
            onClick={onToggleFavorite}
          >
            {isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          </button>
          <button
            className="rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
            type="button"
            onClick={suggestForProject}
          >
            Sugerir para un Proyecto
          </button>
          <span aria-live="polite" className="w-full text-xs text-slate-600">
            {copyMessage || suggestionMessage}
          </span>
        </div>
      </div>
    </dialog>
  );
};

export default ConvocatoriaDetailView;
