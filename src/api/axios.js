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

const dispatchHttpError = (message) => {
  window.dispatchEvent(
    new CustomEvent("http:error", {
      detail: { message, variant: "error" },
    }),
  );
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
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const loginRequest = isLoginRequest(requestUrl);
    const responseData = error.response?.data;
    error.fieldErrors =
      status === 400 &&
      responseData?.errors &&
      typeof responseData.errors === "object" &&
      !Array.isArray(responseData.errors)
        ? responseData.errors
        : null;

    dispatchHttpError(
      error.response
        ? getHttpErrorMessage(status, responseData, { loginRequest })
        : "No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.",
    );

    if (
      status === 401 &&
      !loginRequest &&
      !isPublicSurveyResponseRequest(requestUrl)
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  },
);

export default api;
