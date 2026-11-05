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

const readStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return null;
  }

  try {
    return mapUser(JSON.parse(storedUser));
  } catch (error) {
    console.error("El perfil guardado no es válido y se eliminará.", error);
    localStorage.removeItem("user");
    return null;
  }
};

const clearStoredSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem("token") ? readStoredUser() : null,
  );
  const [loading, setLoading] = useState(
    () =>
      Boolean(
        localStorage.getItem("token") ||
          localStorage.getItem("refreshToken"),
      ),
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const savedToken = localStorage.getItem("token");
    const savedRefreshToken = localStorage.getItem("refreshToken");

    const clearInvalidSession = () => {
      clearStoredSession();
      if (active) {
        setToken(null);
        setUser(null);
      }
    };

    const setAuthenticatedUser = (data) => {
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        throw new Error("No hay un token de acceso para establecer la sesión.");
      }

      const authenticatedUser = mapUser(data);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      if (active) {
        setToken(currentToken);
        setUser(authenticatedUser);
      }
    };

    const handleUnauthorized = () => clearInvalidSession();
    const handleSessionRefreshed = (event) => {
      try {
        setAuthenticatedUser(event.detail);
      } catch (error) {
        console.error("No se pudo restaurar la sesión renovada.", error);
        clearInvalidSession();
      }
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("auth:session-refreshed", handleSessionRefreshed);

    if (!savedToken && !savedRefreshToken) {
      return () => {
        active = false;
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
        window.removeEventListener(
          "auth:session-refreshed",
          handleSessionRefreshed,
        );
        controller.abort();
      };
    }

    const sessionRequest = savedToken
      ? api.get("/auth/me", { signal: controller.signal })
      : api.post(
          "/auth/refresh",
          { refreshToken: savedRefreshToken },
          { signal: controller.signal },
        );

    sessionRequest
      .then(({ data }) => {
        if (active) {
          setAuthenticatedUser(data);
        }
      })
      .catch((error) => {
        if (active && !controller.signal.aborted) {
          if (error.response?.status === 401) {
            clearInvalidSession();
          } else {
            setToken(localStorage.getItem("token"));
            setUser(readStoredUser());
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
      window.removeEventListener(
        "auth:session-refreshed",
        handleSessionRefreshed,
      );
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
    if (typeof data.refreshToken === "string" && data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setLoading(false);
    clearStoredSession();
  };

  const isAuthenticated = Boolean(token && user);

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
