import { useState } from "react";
import { AuthContext } from "./AuthContextValue";

// Proveedor del Estado Global
export const AuthProvider = ({ children }) => {
  // Inicializamos leyendo de localStorage para mantener la sesión al recargar la página
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Estado derivado: es verdadero si existe un token
  const isAuthenticated = !!token;

  // Función para Iniciar Sesión
  const login = (data) => {
    // data es el AuthResponse del backend: { accessToken, tokenType, id, nombre, email, role }
    const { accessToken: newToken, id, nombre, email, role } = data;
    const userData = { id, nombre, email, role };

    setToken(newToken);
    setUser(userData);

    // Persistir en localStorage
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Función para Cerrar Sesión
  const logout = () => {
    setToken(null);
    setUser(null);

    // Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
