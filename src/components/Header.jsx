import { useState } from "react";

export const Header = ({
  user,
  onLogout,
  onOpenSidebar,
  variant = "dashboard",
  isDark = false,
  onLogin,
  onToggleTheme,
  loginLabel,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (variant === "landing") {
    return (
      <header className="fixed inset-x-0 top-0 z-30 flex h-[68px] items-center justify-end border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:left-64 md:h-20 md:px-8">
        {onOpenSidebar && (
          <button
            aria-label="Abrir menú de navegación"
            className="absolute left-4 grid h-10 w-10 place-items-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 md:hidden"
            type="button"
            onClick={onOpenSidebar}
          >
            <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="ml-auto flex items-center justify-end gap-3 md:gap-5">
          {loginLabel ? (
            <button
              className="min-h-9 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-800 transition-colors hover:border-sky-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              type="button"
              onClick={onLogin}
            >
              {loginLabel}
            </button>
          ) : (
            <div
              className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100"
              aria-label="Usuario actual"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-900 dark:bg-sky-900 dark:text-sky-100">
                {(user?.nombre || "U").charAt(0).toUpperCase()}
              </span>
              <span className="grid gap-0.5">
                <strong className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold max-[420px]:max-w-[100px] max-[420px]:text-[11px]">
                  {user?.nombre || "Usuario invitado"}
                </strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 max-md:hidden">
                  {user?.role || "Sesión temporal"}
                </span>
              </span>
            </div>
          )}
          <button
            aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            aria-pressed={isDark}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 transition-colors hover:border-sky-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            type="button"
            onClick={onToggleTheme}
          >
            {isDark ? (
              <svg className="h-5 w-5 fill-none stroke-current" aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg className="h-5 w-5 fill-none stroke-current" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
              </svg>
            )}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-slate-200 bg-white px-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:h-[76px] md:px-[34px]">
      <div className="flex items-center gap-3 text-[15px] font-semibold">
        <button
          aria-label="Abrir menú de navegación"
          className="grid h-10 w-10 place-items-center rounded-full text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 md:hidden"
          type="button"
          onClick={onOpenSidebar}
        >
          <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-[18px]">
        <button
          aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          aria-pressed={isDark}
          className="grid h-10 w-10 place-items-center rounded-full text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
          type="button"
          onClick={onToggleTheme}
        >
          {isDark ? (
            <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </svg>
          ) : (
            <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
            </svg>
          )}
        </button>
        <div className="relative">
          <button
            aria-label="Notificaciones"
            aria-expanded={notificationsOpen}
            className="relative grid h-10 w-10 place-items-center rounded-full text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
          >
            <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] z-40 w-[250px] rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <strong className="text-[13px]">Notificaciones</strong>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">No tienes notificaciones nuevas.</p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            aria-expanded={profileOpen}
            className="flex items-center gap-1.5 rounded-full bg-transparent p-1 text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 md:gap-2 md:px-2"
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-100 text-sm font-bold text-sky-900 dark:bg-sky-900 dark:text-sky-100" aria-hidden="true">
              {(user?.nombre || "U").charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold sm:max-w-[150px]">
              {user?.nombre || "Usuario"}
            </span>
            <svg className="h-4 w-4 fill-none stroke-current max-[420px]:hidden" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] z-40 w-[250px] rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <div className="grid min-w-0 gap-1">
                <strong className="text-[13px]">{user?.nombre || "Usuario"}</strong>
                <span className="mt-1 break-all text-xs text-slate-600 dark:text-slate-300">{user?.email || ""}</span>
              </div>
              <button
                className="mt-3 w-full border-0 border-t border-solid border-slate-200 bg-transparent pt-2.5 text-left text-[13px] text-rose-700 dark:border-slate-700 dark:text-rose-300"
                type="button"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
