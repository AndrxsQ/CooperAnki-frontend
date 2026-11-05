import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextValue";
import api from "../api/axios";

const mapUser = (data) => {
  const role = String(data.role ?? "").toUpperCase();
  if (!role) {
    throw new Error("El servidor no devolvió el rol de la cuenta.");
  }

  const name = data.name ?? data.nombre ?? data.username ?? "Usuario";
  return {
    id: data.id,
    name,
    nombre: name,
    username: data.username,
    email: data.email,
    role,
    accountSystem: data.accountSystem ?? null,
    allowedSystems: Array.isArray(data.allowedSystems)
      ? data.allowedSystems
      : [],
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const savedToken = localStorage.getItem("token");

    const clearInvalidSession = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (active) {
        setToken(null);
        setUser(null);
      }
    };

    const handleUnauthorized = () => clearInvalidSession();
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    if (!savedToken) {
      return () => {
        active = false;
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
        controller.abort();
      };
    }

    api
      .get("/auth/me", { signal: controller.signal })
      .then(({ data }) => {
        if (active) {
          const authenticatedUser = mapUser(data);
          localStorage.setItem("user", JSON.stringify(authenticatedUser));
          setToken(savedToken);
          setUser(authenticatedUser);
        }
      })
      .catch((error) => {
        if (active && !controller.signal.aborted) {
          if (error.response?.status === 401) {
            clearInvalidSession();
          } else {
            setUser(null);
          }
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      controller.abort();
    };
  }, []);

  const login = (data) => {
    const newToken = data.accessToken;
    if (!newToken) {
      throw new Error("El servidor no devolvió un token de acceso.");
    }
    const userData = mapUser(data);

    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
