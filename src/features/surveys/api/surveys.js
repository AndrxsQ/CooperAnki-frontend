import api from "./axios";

const isValidIdentifier = (id) =>
  (typeof id === "string" && id.trim().length > 0) ||
  (typeof id === "number" && Number.isFinite(id));

export const submitSurveyResponse = async (questions, answers) => {
  const response = await api.post(
    "/surveys/responses",
    { questions, answers },
    { validateStatus: (status) => status === 201 },
  );
  const { id, submittedAt } = response.data ?? {};

  if (!isValidIdentifier(id)) {
    throw new Error("El servidor guardó la encuesta, pero no devolvió un identificador válido.");
  }
  if (
    typeof submittedAt !== "string" ||
    !Number.isFinite(Date.parse(submittedAt))
  ) {
    throw new Error("El servidor guardó la encuesta, pero no devolvió una fecha de recepción válida.");
  }

  return { id, submittedAt };
};
