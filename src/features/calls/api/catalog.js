import api from "../../../api/axios";

// La convocatoria del catálogo no trae datos de emparejamiento (matchId,
// compatibilityScore, nlpJustification, status, calculatedAt), por lo que la
// validación se centra en la información de funding_opportunities. Los campos
// nuevos siguen siendo opcionales mientras el backend termina de exponerlos.
const isOptionalText = (value) => value == null || typeof value === "string";

const isOptionalTextList = (value) =>
  value == null ||
  typeof value === "string" ||
  (Array.isArray(value) && value.every((item) => typeof item === "string"));

const isOptionalAmount = (value) =>
  value == null || Number.isFinite(Number(value));

const isFundingOpportunity = (opportunity) =>
  opportunity &&
  Number.isInteger(Number(opportunity.id)) &&
  typeof opportunity.sourceUrl === "string" &&
  typeof opportunity.title === "string" &&
  isOptionalText(opportunity.cooperatingEntity) &&
  isOptionalText(opportunity.impactArea) &&
  isOptionalText(opportunity.requirementsDescription) &&
  isOptionalAmount(opportunity.maxAmount) &&
  isOptionalText(opportunity.closingDate) &&
  isOptionalText(opportunity.donorCountry) &&
  isOptionalText(opportunity.cooperationType) &&
  isOptionalText(opportunity.organizationType) &&
  isOptionalText(opportunity.projectType) &&
  isOptionalTextList(opportunity.targetPopulations) &&
  isOptionalText(opportunity.applicationMethod) &&
  isOptionalText(opportunity.language) &&
  isOptionalText(opportunity.currency) &&
  isOptionalAmount(opportunity.amountInCop) &&
  isOptionalText(opportunity.sourcePage) &&
  isOptionalText(opportunity.sourceDocument) &&
  isOptionalText(opportunity.opportunityStatus) &&
  isOptionalText(opportunity.opportunityStatusDetail) &&
  isOptionalText(opportunity.contactPerson) &&
  isOptionalText(opportunity.contactPhone) &&
  isOptionalText(opportunity.contactFax) &&
  isOptionalText(opportunity.contactAddress) &&
  isOptionalText(opportunity.contactCity) &&
  isOptionalText(opportunity.contactEmail) &&
  isOptionalText(opportunity.localContactPerson) &&
  isOptionalText(opportunity.localContactPhone) &&
  isOptionalText(opportunity.localContactAddress) &&
  isOptionalText(opportunity.localContactCity) &&
  isOptionalText(opportunity.localContactEmail) &&
  isOptionalText(opportunity.notes);

const requireFundingOpportunity = (data) => {
  if (!isFundingOpportunity(data)) {
    throw new Error(
      "La convocatoria no tiene el formato esperado por el catálogo.",
    );
  }

  return data;
};

const requireFundingOpportunityPage = (data) => {
  if (
    !data ||
    !Array.isArray(data.content) ||
    !Number.isInteger(data.page) ||
    !Number.isInteger(data.size) ||
    !Number.isInteger(data.totalElements) ||
    !Number.isInteger(data.totalPages) ||
    typeof data.first !== "boolean" ||
    typeof data.last !== "boolean" ||
    data.content.some((opportunity) => !isFundingOpportunity(opportunity))
  ) {
    throw new Error(
      "La respuesta del catálogo de convocatorias no tiene el formato esperado.",
    );
  }

  return data;
};

const trimmed = (value) => (typeof value === "string" ? value.trim() : "");

const optionalNumber = (value) =>
  value === "" || value === null || value === undefined ? undefined : value;

export const getFundingOpportunities = async ({
  q = "",
  impactArea = "",
  donorCountry = "",
  currency = "",
  minAmount = "",
  maxAmount = "",
  closingBefore = "",
  closingAfter = "",
  page = 0,
  size = 20,
  signal,
} = {}) => {
  const { data } = await api.get("/funding-opportunities", {
    params: {
      q: trimmed(q) || undefined,
      impactArea: trimmed(impactArea) || undefined,
      donorCountry: trimmed(donorCountry) || undefined,
      currency: trimmed(currency) || undefined,
      minAmount: optionalNumber(minAmount),
      maxAmount: optionalNumber(maxAmount),
      closingBefore: closingBefore || undefined,
      closingAfter: closingAfter || undefined,
      page,
      size,
    },
    signal,
  });

  return requireFundingOpportunityPage(data);
};

export const getFundingOpportunityById = async (id, { signal } = {}) => {
  const { data } = await api.get(
    `/funding-opportunities/${encodeURIComponent(id)}`,
    { signal },
  );

  return requireFundingOpportunity(data);
};
