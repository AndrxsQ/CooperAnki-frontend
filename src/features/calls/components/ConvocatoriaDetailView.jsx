import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { MatchingScore } from "./MatchingScore";
import { getOdsGoal } from "../data/ods";
import { formatCurrency } from "../utils/formatters";

const cleanText = (value) => {
  if (!value) return "";
  const parsed = new DOMParser().parseFromString(String(value), "text/html");
  return parsed.body.textContent?.trim() || "";
};

const renderTextList = (value) => {
  const text = cleanText(value);
  if (!text) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No especificado.
      </p>
    );
  }

  const items = text
    .split(/\r?\n|•/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length > 1) {
    return (
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
      {text}
    </p>
  );
};

const DetailField = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-slate-800 dark:text-slate-200">
      {value || "No especificado"}
    </dd>
  </div>
);

const characteristicFields = [
  { key: "paisDonante", label: "País del donante" },
  { key: "tipoCooperacion", label: "Tipo de cooperación" },
  { key: "tipoProyectos", label: "Tipo de proyectos" },
  { key: "idioma", label: "Idioma" },
  { key: "estado", label: "Estado" },
  { key: "detalleEstado", label: "Detalle del estado" },
  { key: "moneda", label: "Moneda" },
  { key: "portalOrigen", label: "Portal de origen" },
  { key: "documentoFuente", label: "Documento fuente" },
];

const contactFields = [
  { key: "persona", label: "Persona de contacto" },
  { key: "telefono", label: "Teléfono" },
  { key: "fax", label: "Fax" },
  { key: "direccion", label: "Dirección" },
  { key: "ciudad", label: "Ciudad" },
  { key: "email", label: "Correo electrónico" },
];

const ContactSection = ({ title, contact }) => {
  const hasData = contactFields.some(({ key }) => contact?.[key]);

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {hasData ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          {contactFields.map(({ key, label }) => (
            <DetailField key={key} label={label} value={contact?.[key]} />
          ))}
        </dl>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No especificado.
        </p>
      )}
    </section>
  );
};

const ConvocatoriaDetailView = ({
  convocatoria,
  isFavorite,
  onClose,
  onSuggest,
  onToggleFavorite,
}) => {
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
    <Modal
      open
      onClose={onClose}
      size="md"
      title={convocatoria.titulo || "Convocatoria sin título"}
      footer={
        <div className="flex flex-wrap items-center gap-2 px-6 py-4">
          <Button onClick={copyOfficialLink} variant="outline">
            Copiar enlace
          </Button>
          <Button
            aria-pressed={isFavorite}
            onClick={onToggleFavorite}
            variant="outline"
          >
            {isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          </Button>
          <Button onClick={suggestForProject}>
            Sugerir para un Proyecto
          </Button>
          <span aria-live="polite" className="w-full text-xs text-slate-600 dark:text-slate-300">
            {copyMessage || suggestionMessage}
          </span>
        </div>
      }
    >
      <div className="space-y-6 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
            {convocatoria.organismoDonante || "Organismo no especificado"}
          </p>
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

          <MatchingScore
            score={convocatoria.compatibilityScore}
            justification={convocatoria.matchingJustification}
          />

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Descripción
            </h3>
            {renderTextList(convocatoria.descripcion)}
          </section>
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Bases técnicas
            </h3>
            {renderTextList(convocatoria.basesTecnicas)}
          </section>
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Criterios de elegibilidad
            </h3>
            {renderTextList(convocatoria.criteriosElegibilidad)}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Características de la convocatoria
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              {characteristicFields.map(({ key, label }) => (
                <DetailField
                  key={key}
                  label={label}
                  value={convocatoria[key]}
                />
              ))}
              <DetailField
                label="Valor en pesos"
                value={
                  convocatoria.valorEnPesos === null ||
                  convocatoria.valorEnPesos === undefined
                    ? null
                    : formatCurrency(convocatoria.valorEnPesos, "COP")
                }
              />
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Poblaciones objetivo
            </h3>
            {renderTextList(convocatoria.poblacionesObjetivo)}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Tipo de organización
            </h3>
            {renderTextList(convocatoria.tipoOrganizacion)}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Forma de presentación
            </h3>
            {renderTextList(convocatoria.formaPresentacion)}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Observaciones
            </h3>
            {renderTextList(convocatoria.observaciones)}
          </section>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Monto máximo ofertado
            </p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(convocatoria.montoMaximo, convocatoria.moneda)}
            </p>
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Datos de contacto
            </h3>
            <div className="grid gap-4">
              <ContactSection
                contact={convocatoria.contactoExterior}
                title="Contacto en el exterior"
              />
              <ContactSection
                contact={convocatoria.contactoColombia}
                title="Contacto en Colombia"
              />
            </div>
          </section>

          {externalUrl ? (
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-200"
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enlace oficial no disponible.
            </p>
          )}
      </div>
    </Modal>
  );
};

export default ConvocatoriaDetailView;
