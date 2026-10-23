import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 300000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const isLoginRequest = /\/auth\/login$/.test(config.url ?? "");

    if (token && !isLoginRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = /\/auth\/login$/.test(
        error.config?.url ?? "",
      );

      if (!isLoginRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }

    return Promise.reject(error);
  },
);

export default api;
