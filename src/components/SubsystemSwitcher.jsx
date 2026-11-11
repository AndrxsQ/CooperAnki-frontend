import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getAccessibleSubsystems,
  getSubsystemFromPath,
  getSubsystemsForRole,
} from "../config/subsystems";

// Selector de subsistema que solo aparece cuando el rol da acceso a más de uno.
// Al elegir un subsistema se navega a su vista de inicio.
export const SubsystemSwitcher = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const options = getAccessibleSubsystems(user?.role);

  if (options.length <= 1) {
    return null;
  }

  const currentId =
    getSubsystemFromPath(pathname) ?? getSubsystemsForRole(user?.role)[0];
  const current = options.find((subsystem) => subsystem.id === currentId) ?? options[0];

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-800 transition-colors hover:border-sky-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 max-[520px]:px-2"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="inline-grid h-5 w-5 place-items-center rounded bg-sky-100 text-[11px] font-bold text-sky-900 dark:bg-sky-900 dark:text-sky-100">
          ⇄
        </span>
        <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap max-[520px]:hidden">
          {current.shortLabel}
        </span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 fill-none stroke-current transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+12px)] z-40 grid w-[260px] gap-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          role="menu"
        >
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Subsistemas
          </p>
          {options.map((subsystem) => {
            const isCurrent = subsystem.id === current.id;
            return (
              <button
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                  isCurrent
                    ? "bg-sky-50 text-sky-900 dark:bg-slate-800 dark:text-sky-200"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
                key={subsystem.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(subsystem.home);
                }}
              >
                <span className="min-w-0">{subsystem.label}</span>
                {isCurrent && (
                  <span aria-hidden="true" className="shrink-0 text-sky-700 dark:text-sky-300">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubsystemSwitcher;
