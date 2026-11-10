import api from "../../../api/axios";

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
    typeof match.nlpJustification === "string");

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
