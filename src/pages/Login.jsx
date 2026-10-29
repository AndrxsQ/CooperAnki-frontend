import { LoginForm } from "../components/LoginForm";
import { useTheme } from "../context/useTheme";

const Login = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <button
        aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        aria-pressed={isDark}
        className="fixed right-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition-colors hover:border-sky-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:right-6 sm:top-6"
        type="button"
        onClick={toggleTheme}
      >
        {isDark ? (
          <svg
            aria-hidden="true"
            className="h-5 w-5 fill-none stroke-current"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="h-5 w-5 fill-none stroke-current"
            viewBox="0 0 24 24"
          >
            <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
          </svg>
        )}
      </button>
      <main className="grid min-h-screen place-items-center px-4 py-8 sm:px-6 md:px-8">
        <LoginForm />
      </main>
    </div>
  );
};

export default Login