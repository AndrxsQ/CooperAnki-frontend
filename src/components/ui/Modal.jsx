import { useEffect, useId, useRef } from "react";

const sizes = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export const Modal = ({
  children,
  className = "",
  closeLabel = "Cerrar diálogo",
  footer,
  onClose,
  open,
  size = "md",
  title,
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "Diálogo"}
      className={`m-auto max-h-[90vh] w-[calc(100%-2rem)] ${sizes[size] ?? sizes.md} overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose?.();
      }}
      ref={dialogRef}
    >
      {title && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <h2
            className="m-0 text-xl font-bold leading-snug text-slate-900 dark:text-slate-100"
            id={titleId}
          >
            {title}
          </h2>
          <button
            aria-label={closeLabel}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                d="m6 6 12 12M18 6 6 18"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </header>
      )}
      <div className="max-h-[calc(90vh-5rem)] overflow-y-auto">{children}</div>
      {footer && (
        <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
          {footer}
        </footer>
      )}
    </dialog>
  );
};
