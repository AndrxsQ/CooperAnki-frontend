import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        Verificando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    requiredRole &&
    user?.role?.toUpperCase() !== requiredRole.toUpperCase()
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <div className="max-w-md">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Acceso denegado
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </main>
    );
  }

  return <Outlet />;
};