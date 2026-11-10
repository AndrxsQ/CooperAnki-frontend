import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useTheme } from "../../../context/useTheme";
import { useToast } from "../../../context/useToast";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { Button } from "../../../components/ui/Button";

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      addToast({
        message: getUserFacingErrorMessage(
          error,
          "No fue posible cerrar la sesión en el servidor.",
        ),
      });
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#123b5d] text-lg font-bold text-white"
            >
              C
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                Coopera2075
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Portal personal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden max-w-48 truncate text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
              {user?.fullName ?? user?.name}
            </span>
            <button
              aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              aria-pressed={isDark}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={toggleTheme}
              type="button"
            >
              {isDark ? "☀" : "◐"}
            </button>
            <Button onClick={handleLogout} size="sm" variant="outline">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 md:py-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 lg:px-8">
        <aside>
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            Mi espacio
          </p>
          <nav
            aria-label="Navegación de cuenta"
            className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-1"
          >
            <NavLink
              end
              to="/account"
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-semibold no-underline transition ${
                  isActive
                    ? "bg-[#eaf4f9] text-[#123b5d] dark:bg-slate-800 dark:text-sky-300"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              Cuenta
            </NavLink>
            <NavLink
              to="/account/legal-information"
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-sm font-semibold no-underline transition ${
                  isActive
                    ? "bg-[#eaf4f9] text-[#123b5d] dark:bg-slate-800 dark:text-sky-300"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              Información Jurídica
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
