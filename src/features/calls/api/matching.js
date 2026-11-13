import api from "../../../api/axios";

// Campos nuevos del ProjectMatchResponse: son opcionales mientras el backend
// termina de exponerlos, por lo que se aceptan como texto/número o null.
const isOptionalText = (value) => value == null || typeof value === "string";

const isOptionalTextList = (value) =>
  value == null ||
  typeof value === "string" ||
  (Array.isArray(value) && value.every((item) => typeof item === "string"));

const isOptionalAmount = (value) =>
  value == null || Number.isFinite(Number(value));

const isMatch = (match) =>
  match &&
  Number.isInteger(Number(match.matchId)) &&
  Number.isInteger(Number(match.fundingOpportunityId)) &&
  typeof match.title === "string" &&
  typeof match.sourceUrl === "string" &&
  (match.cooperatingEntity == null ||
    typeof match.cooperatingEntity === "string") &&
  (match.impactArea == null || typeof match.impactArea === "string") &&
  (match.requirementsDescription == null ||
    typeof match.requirementsDescription === "string") &&
  (match.maxAmount == null || Number.isFinite(Number(match.maxAmount))) &&
  (match.closingDate == null || typeof match.closingDate === "string") &&
  Number.isFinite(Number(match.compatibilityScore)) &&
  Number(match.compatibilityScore) >= 0 &&
  Number(match.compatibilityScore) <= 100 &&
  typeof match.status === "string" &&
  typeof match.calculatedAt === "string" &&
  (match.nlpJustification == null ||
    typeof match.nlpJustification === "string") &&
  // Características ampliadas de la convocatoria.
  isOptionalText(match.donorCountry) &&
  isOptionalText(match.cooperationType) &&
  isOptionalText(match.organizationType) &&
  isOptionalText(match.projectType) &&
  isOptionalTextList(match.targetPopulations) &&
  isOptionalText(match.applicationMethod) &&
  isOptionalText(match.language) &&
  isOptionalText(match.currency) &&
  isOptionalAmount(match.amountInCop) &&
  isOptionalText(match.sourcePage) &&
  isOptionalText(match.sourceDocument) &&
  isOptionalText(match.opportunityStatus) &&
  isOptionalText(match.opportunityStatusDetail) &&
  isOptionalText(match.contactPerson) &&
  isOptionalText(match.contactPhone) &&
  isOptionalText(match.contactFax) &&
  isOptionalText(match.contactAddress) &&
  isOptionalText(match.contactCity) &&
  isOptionalText(match.contactEmail) &&
  isOptionalText(match.localContactPerson) &&
  isOptionalText(match.localContactPhone) &&
  isOptionalText(match.localContactAddress) &&
  isOptionalText(match.localContactCity) &&
  isOptionalText(match.localContactEmail) &&
  isOptionalText(match.notes);

const requireMatchPage = (data) => {
  if (
    !data ||
    !Array.isArray(data.content) ||
    !Number.isInteger(data.page) ||
    !Number.isInteger(data.size) ||
    !Number.isInteger(data.totalElements) ||
    !Number.isInteger(data.totalPages) ||
    typeof data.first !== "boolean" ||
    typeof data.last !== "boolean" ||
    data.content.some((match) => !isMatch(match))
  ) {
    throw new Error(
      "La respuesta de recomendaciones no tiene el formato esperado.",
    );
  }

  return data;
};

export const getProjectRecommendations = async (
  projectId,
  {
    impactArea = "",
    minAmount = "",
    maxAmount = "",
    closingBefore = "",
    page = 0,
    size = 20,
    signal,
  } = {},
) => {
  const { data } = await api.get(
    `/projects/${encodeURIComponent(projectId)}/recommendations`,
    {
      params: {
        impactArea: impactArea.trim() || undefined,
        minAmount: minAmount === "" ? undefined : minAmount,
        maxAmount: maxAmount === "" ? undefined : maxAmount,
        closingBefore: closingBefore || undefined,
        page,
        size,
      },
      signal,
    },
  );

  return requireMatchPage(data);
};
