import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const ProtectedRoute = () => {
  const { token, loading } = useAuth(); // Extraemos el token del estado global

  // Estado de carga que evita que la app redirija a /login mientras valida si hay un token guardado (por ejemplo, en localStorage)
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Verificación de autenticación
  if (!token) {
    // replace evita que la ruta protegida quede guardada en el historial de navegación
    return <Navigate to="/" replace />;
  }

  // Si hay token válido, renderiza los componentes/rutas hijas
  return <Outlet />;
};