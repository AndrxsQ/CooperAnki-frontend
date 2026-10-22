import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor de Peticiones (Request)
api.interceptors.request.use(
  (config) => {
    // Obtener el token almacenado en localStorage
    const token = localStorage.getItem("token");

    // Si existe el token, se adjunta al encabezado Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor de Respuestas (Response)
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa la retorna directamente
    return response;
  },
  (error) => {
    // Verificar si el error proviene del servidor
    if (error.response) {
      const { status } = error.response;

      // En login y register un 401 es un fallo de credenciales, no una sesión expirada
      const isAuthRequest = /\/auth\/(login|register)$/.test(
        error.config?.url ?? "",
      );

      // Solo el 401 (Unauthorized) indica sesión inválida o expirada. El backend responde 403 (Forbidden)
      // cuando el usuario autenticado no tiene permisos, y en ese caso la sesión se conserva
      if (status === 401 && !isAuthRequest) {
        // Limpiar el estado de la sesión en almacenamiento local
        localStorage.removeItem("token");
        localStorage.removeItem("user"); // Si guardas datos del usuario

        // Redirigir al usuario a la pantalla de login si no está ya allí
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
