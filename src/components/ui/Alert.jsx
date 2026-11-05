const variants = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  error:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
};

export const Alert = ({
  children,
  className = "",
  onDismiss,
  title,
  variant = "info",
}) => (
  <div
    aria-live={variant === "error" || variant === "warning" ? "assertive" : "polite"}
    className={`rounded-lg border p-3 text-sm ${variants[variant] ?? variants.info} ${className}`}
    role={variant === "error" || variant === "warning" ? "alert" : "status"}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
      {onDismiss && (
        <button
          aria-label="Cerrar notificación"
          className="shrink-0 rounded px-1 text-lg leading-5 opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onDismiss}
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  </div>
);
