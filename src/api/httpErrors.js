export const getHttpErrorMessage = (status, data, { loginRequest = false } = {}) => {
  if (status >= 500) {
    return "Ocurrió un error inesperado. Intenta de nuevo más tarde.";
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  switch (status) {
    case 400:
      return "Revisa los campos e intenta de nuevo.";
    case 401:
      return loginRequest
        ? "Credenciales incorrectas. Intenta de nuevo."
        : "Tu sesión expiró. Inicia sesión nuevamente.";
    case 403:
      return "No tienes permisos para realizar esta acción.";
    case 404:
      return "No se encontró el recurso solicitado.";
    case 409:
      return "La operación entra en conflicto con los datos existentes.";
    default:
      return "No fue posible completar la solicitud. Intenta de nuevo.";
  }
};

export const getUserFacingErrorMessage = (error, fallback) => {
  if (error?.response) {
    return getHttpErrorMessage(error.response.status, error.response.data);
  }

  if (error?.isAxiosError) {
    return "No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.";
  }

  return error?.message || fallback;
};
