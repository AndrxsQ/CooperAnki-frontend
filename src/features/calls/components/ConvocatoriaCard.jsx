import { useState } from "react";
import ConvocatoriaDetailView from "./ConvocatoriaDetailView";
import { getOdsGoal } from "../data/ods";

const FAVORITES_KEY = "cooperanki:favoriteConvocatorias";

const readFavorites = () => {
  try {
    const storedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(storedFavorites) ? storedFavorites : [];
  } catch {
    return [];
  }
};

const getDaysUntilClosing = (closingDate) => {
  if (!closingDate) return null;
  const closing = new Date(`${closingDate}T23:59:59`);
  if (Number.isNaN(closing.getTime())) return null;
  return Math.ceil((closing.getTime() - Date.now()) / 86_400_000);
};

const formatCurrency = (amount, currency = "COP") => {
  if (amount === null || amount === undefined || amount === "") return "No especificado";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const formatDate = (date) => {
  if (!date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
    return "Fecha no especificada";
  }
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

const getClosingStatus = (daysRemaining) => {
  if (daysRemaining === null) {
    return { label: "Cierre sin fecha", classes: "bg-slate-100 text-slate-600" };
  }
  if (daysRemaining < 0) {
    return { label: "Convocatoria cerrada", classes: "bg-slate-100 text-slate-600" };
  }
  if (daysRemaining <= 7) {
    return {
      label: daysRemaining === 0 ? "Cierra hoy" : `Cierra en ${daysRemaining} días`,
      classes: "bg-red-100 text-red-800",
    };
  }
  if (daysRemaining < 30) {
    return {
      label: `Cierra en ${daysRemaining} días`,
      classes: "bg-amber-100 text-amber-800",
    };
  }
  return { label: formatDateForStatus(daysRemaining), classes: "bg-emerald-50 text-emerald-800" };
};

const formatDateForStatus = (daysRemaining) => `Cierra en ${daysRemaining} días`;

const ConvocatoriaCard = ({ convocatoria, onSuggest }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() =>
    readFavorites().includes(String(convocatoria.id)),
  );
  const daysRemaining = getDaysUntilClosing(convocatoria.fechaCierre);
  const closingStatus = getClosingStatus(daysRemaining);
  const ods = (convocatoria.ods || [])
    .map((goalId) => getOdsGoal(goalId))
    .filter(Boolean);

  const toggleFavorite = () => {
    const favorites = readFavorites();
    const id = String(convocatoria.id);
    const nextFavorites = isFavorite
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...new Set([...favorites, id])];

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
      setIsFavorite(!isFavorite);
    } catch {
      window.alert("No fue posible guardar el favorito en este navegador.");
    }
  };

  return (
    <>
      <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {convocatoria.organismoDonante || "Organismo no especificado"}
          </p>
          <button
            aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
            aria-pressed={isFavorite}
            className={`shrink-0 rounded-full p-2 transition hover:bg-amber-50 ${
              isFavorite ? "text-amber-500" : "text-slate-400"
            }`}
            type="button"
            onClick={toggleFavorite}
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill={isFavorite ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"
              />
            </svg>
          </button>
        </div>

        <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
          {convocatoria.titulo || "Convocatoria sin título"}
        </h2>

        <div className="mt-4 flex flex-wrap gap-1.5" aria-label="ODS impactados">
          {ods.length ? ods.map((goal) => (
            <span
              key={goal.id}
              aria-label={`ODS ${goal.id}: ${goal.name}`}
              className="inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-bold text-white"
              style={{ backgroundColor: goal.color }}
              title={`ODS ${goal.id}: ${goal.name}`}
            >
              {goal.id}
            </span>
          )) : (
            <span className="text-xs text-slate-500">ODS no especificados</span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Monto máximo</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatCurrency(convocatoria.montoMaximo, convocatoria.moneda)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Fecha de cierre</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatDate(convocatoria.fechaCierre)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${closingStatus.classes}`}>
            {closingStatus.label}
          </span>
          <button
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
            type="button"
            onClick={() => setDetailOpen(true)}
          >
            Ver detalle
          </button>
        </div>
      </article>

      {detailOpen && (
        <ConvocatoriaDetailView
          convocatoria={convocatoria}
          isFavorite={isFavorite}
          onClose={() => setDetailOpen(false)}
          onSuggest={onSuggest}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </>
  );
};

export default ConvocatoriaCard;
