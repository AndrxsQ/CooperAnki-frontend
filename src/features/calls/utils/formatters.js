const FALLBACK_CURRENCY = "COP";

// Intl.NumberFormat solo acepta códigos ISO 4217 de tres letras, pero la fuente
// de las convocatorias registra la moneda como texto libre ("PESO COL", "LBR").
// Se valida antes de formatear para no romper el render de la tarjeta.
const resolveCurrencyCode = (currency) => {
  if (typeof currency !== "string") return null;
  const code = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;

  try {
    new Intl.NumberFormat("es-CO", { style: "currency", currency: code });
    return code;
  } catch {
    return null;
  }
};

export const formatCurrency = (amount, currency = FALLBACK_CURRENCY) => {
  if (amount === null || amount === undefined || amount === "") {
    return "No especificado";
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) return "No especificado";

  const code = resolveCurrencyCode(currency);
  if (code) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const plain = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(value);

  const rawCurrency = typeof currency === "string" ? currency.trim() : "";
  return rawCurrency ? `${plain} ${rawCurrency}` : plain;
};

export const formatDate = (date) => {
  if (!date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
    return "Fecha no especificada";
  }
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};
