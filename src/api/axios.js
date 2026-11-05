import axios from "axios";
import { getHttpErrorMessage } from "./httpErrors";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 300000,
});

const isPublicSurveyResponseRequest = (url) =>
  /(?:^|\/)surveys\/responses(?:[?#]|$)/.test(url ?? "");

const isLoginRequest = (url) =>
  /(?:^|\/)auth\/login(?:[?#]|$)/.test(url ?? "");

const isRefreshRequest = (url) =>
  /(?:^|\/)auth\/refresh(?:[?#]|$)/.test(url ?? "");

const dispatchHttpError = (message) => {
  window.dispatchEvent(
    new CustomEvent("http:error", {
      detail: { message, variant: "error" },
    }),
  );
};

let refreshPromise = null;
let unauthorizedNotified = false;

const clearStoredSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const notifySessionExpired = (responseData) => {
  clearStoredSession();
  window.dispatchEvent(new Event("auth:unauthorized"));
  if (!unauthorizedNotified) {
    unauthorizedNotified = true;
    dispatchHttpError(getHttpErrorMessage(401, responseData));
  }
};

const refreshAuthSession = () => {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return Promise.reject(new Error("No hay un refresh token disponible."));
    }

    refreshPromise = api
      .post("/auth/refresh", { refreshToken })
      .then(({ data }) => {
        if (localStorage.getItem("refreshToken") !== refreshToken) {
          const error = new Error("La sesión cambió durante la renovación.");
          error.code = "ERR_AUTH_SESSION_CHANGED";
          throw error;
        }

        if (
          typeof data?.accessToken !== "string" ||
          !data.accessToken ||
          typeof data?.refreshToken !== "string" ||
          !data.refreshToken
        ) {
          throw new Error("La respuesta de renovación de sesión no es válida.");
        }

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        unauthorizedNotified = false;
        window.dispatchEvent(
          new CustomEvent("auth:session-refreshed", { detail: data }),
        );
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const loginRequest = isLoginRequest(config.url);

    if (token && !loginRequest && !isPublicSurveyResponseRequest(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (isLoginRequest(response.config?.url)) {
      unauthorizedNotified = false;
    }
    return response;
  },
  async (error) => {
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const loginRequest = isLoginRequest(requestUrl);
    const refreshRequest = isRefreshRequest(requestUrl);
    const responseData = error.response?.data;

    if (refreshRequest) {
      return Promise.reject(error);
    }

    error.fieldErrors =
      status === 400 &&
      responseData?.errors &&
      typeof responseData.errors === "object" &&
      !Array.isArray(responseData.errors)
        ? responseData.errors
        : null;

    if (
      status === 401 &&
      !loginRequest &&
      !refreshRequest &&
      !isPublicSurveyResponseRequest(requestUrl)
    ) {
      const request = error.config;
      if (request && !request._retry && localStorage.getItem("refreshToken")) {
        request._retry = true;
        try {
          const refreshed = await refreshAuthSession();
          request.headers = request.headers ?? {};
          request.headers.Authorization = `${refreshed.tokenType || "Bearer"} ${refreshed.accessToken}`;
          return api.request(request);
        } catch (refreshError) {
          if (refreshError?.code !== "ERR_AUTH_SESSION_CHANGED") {
            notifySessionExpired(responseData);
          }
          return Promise.reject(error);
        }
      }

      notifySessionExpired(responseData);
    } else {
      dispatchHttpError(
        error.response
          ? getHttpErrorMessage(status, responseData, { loginRequest })
          : "No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
      );
    }

    return Promise.reject(error);
  },
);

export default api;
