const percentFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

export const MatchingScore = ({ score, justification }) => {
  const numericScore = Number(score);
  const hasScore =
    score !== null &&
    score !== undefined &&
    score !== "" &&
    Number.isFinite(numericScore) &&
    numericScore >= 0 &&
    numericScore <= 100;
  const normalizedScore = hasScore ? numericScore : 0;
  const reason =
    typeof justification === "string" ? justification.trim() : "";

  return (
    <section
      aria-label="Compatibilidad de la convocatoria"
      className="grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900 dark:bg-emerald-950/30"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Compatibilidad con el proyecto
        </h3>
        {hasScore ? (
          <span className="shrink-0 text-lg font-bold tabular-nums text-emerald-800 dark:text-emerald-300">
            {percentFormatter.format(normalizedScore)}%
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            No disponible
          </span>
        )}
      </div>

      {hasScore && (
        <div
          aria-label={`Compatibilidad: ${percentFormatter.format(normalizedScore)}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={normalizedScore}
          className="h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900"
          role="meter"
        >
          <div
            aria-hidden="true"
            className="h-full rounded-full bg-emerald-700 transition-[width] dark:bg-emerald-400"
            style={{ width: `${normalizedScore}%` }}
          />
        </div>
      )}

      <div className="grid gap-1">
        <h4 className="m-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
          Razones del emparejamiento
        </h4>
        <p className="m-0 whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {reason ||
            "El backend aún no proporciona el detalle de las razones para esta recomendación."}
        </p>
      </div>
    </section>
  );
};
