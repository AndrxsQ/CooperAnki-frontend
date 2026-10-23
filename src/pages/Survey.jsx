import { useState } from "react";
import { useTheme } from "../context/useTheme";
import {
  buildSurveySteps,
  getMunicipalityOptions,
  isUnknownAnswer,
} from "../data/surveyQuestions";

const unknownAnswer = "No sabe / No responde";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-700 px-5 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:outline-sky-400";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";
const fieldClass =
  "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400";

const getValidationError = (question, answer) => {
  if (isUnknownAnswer(answer)) {
    return "";
  }
  if (Array.isArray(answer)) {
    return answer.length ? "" : "Selecciona al menos una opción para continuar.";
  }
  if (typeof answer !== "string" || !answer.trim()) {
    return "Completa tu respuesta para continuar.";
  }
  if (question.type === "number") {
    if (!/^\d+([.,]\d+)?$/.test(answer.trim())) {
      return "Ingresa un valor numérico válido.";
    }
    const value = Number(answer.replace(",", "."));
    if (question.min !== undefined && value < question.min) {
      return `El valor debe ser igual o mayor que ${question.min}.`;
    }
    if (question.max !== undefined && value > question.max) {
      return `El valor debe ser igual o menor que ${question.max}.`;
    }
  }
  return "";
};

const Survey = () => {
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [consent, setConsent] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const steps = buildSurveySteps(answers);

  const isWelcome = step === -1;
  const isComplete = step >= steps.length;
  const question = steps[step];
  const answer = question ? answers[question.id] ?? "" : "";
  const validationError =
    question && showValidation ? getValidationError(question, answer) : "";

  const updateAnswer = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setShowValidation(false);
  };

  const goNext = (event) => {
    event.preventDefault();
    if (getValidationError(question, answer)) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setStep((current) => current + 1);
  };

  const goBack = () => {
    setShowValidation(false);
    setStep((current) => current - 1);
  };

  const restartSurvey = () => {
    setAnswers({});
    setConsent(false);
    setShowValidation(false);
    setStep(-1);
  };

  const selectUnknown = () => {
    updateAnswer(isUnknownAnswer(answer) ? "" : unknownAnswer);
  };

  const selectedDepartment = answers["7"];
  const options =
    question?.id === "8" && selectedDepartment !== unknownAnswer
      ? [
          ...getMunicipalityOptions(selectedDepartment),
          "Otro / no aparece en la lista",
        ]
      : question?.id === "8"
        ? [unknownAnswer]
        : question?.options ?? [];

  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6">
      <button
        aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        aria-pressed={isDark}
        className="fixed right-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition-colors hover:border-sky-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:right-6 sm:top-6"
        type="button"
        onClick={toggleTheme}
      >
        {isDark ? (
          <svg
            aria-hidden="true"
            className="h-5 w-5 fill-none stroke-current"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="h-5 w-5 fill-none stroke-current"
            viewBox="0 0 24 24"
          >
            <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
          </svg>
        )}
      </button>

      <section
        aria-label="Encuesta de autodiagnóstico empresarial"
        className={`flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 sm:p-10 ${
          isWelcome
            ? "my-auto max-h-[calc(100vh-2rem)] max-w-4xl overflow-y-auto"
            : "min-h-[min(620px,calc(100vh-4rem))] max-w-3xl"
        }`}
      >
        {isWelcome ? (
          <div className="grid gap-6">
            <header className="grid gap-3 text-center">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                Encuesta
              </p>
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                ENCUESTA DE AUTODIAGNÓSTICO EMPRESARIAL
              </h1>
            </header>

            <div className="grid gap-4 rounded-xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:p-6">
              <p className="m-0">
                <strong className="text-slate-900 dark:text-slate-100">
                  OBJETIVO.
                </strong>{" "}
                Identificar capacidades, experiencia, conocimientos, ingresos,
                aportes familiares, activos, actividades productivas, oficios,
                servicios profesionales, clientes y necesidades de inversión
                para diseñar una ruta de fortalecimiento individual, familiar o
                asociativo.
              </p>
              <p className="m-0">
                <strong className="text-slate-900 dark:text-slate-100">
                  Orientaciones:
                </strong>{" "}
                aplicar mediante entrevista, preferiblemente en conversación;
                registrar valores aproximados y período; permitir “No sabe/No
                responde”. Distinguir ventas, costos, ganancia e ingresos de
                otras fuentes.
              </p>
              <p className="m-0">
                <strong className="text-slate-900 dark:text-slate-100">
                  Tiempo estimado:
                </strong>{" "}
                45–70 minutos.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:text-slate-200">
              <input
                checked={consent}
                className="mt-1 h-4 w-4 shrink-0 accent-sky-700"
                onChange={(event) => setConsent(event.target.checked)}
                type="checkbox"
              />
              <span>
                ¿La participante acepta voluntariamente responder y el uso de
                datos con fines de diagnóstico y planeación del proyecto?
                <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">
                  Las respuestas de esta versión preliminar solo permanecerán
                  durante esta sesión; no se envían ni se guardan.
                </span>
              </span>
            </label>

            <div className="flex justify-center">
              <button
                className={primaryButtonClass}
                disabled={!consent}
                type="button"
                onClick={() => setStep(0)}
              >
                Empezar Encuesta
              </button>
            </div>
          </div>
        ) : isComplete ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              Encuesta completada
            </p>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Gracias por responder
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Las respuestas no se envían ni se guardan en esta versión.
            </p>
            <button
              className={`${primaryButtonClass} mt-8`}
              type="button"
              onClick={restartSurvey}
            >
              Enviar Respuestas
            </button>
          </div>
        ) : question ? (
          <>
            <header className="mb-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300">
                {question.section}
              </p>
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  Pregunta {step + 1} de {steps.length}
                </span>
                <span>
                  {Math.round(((step + 1) / steps.length) * 100)}%
                </span>
              </div>
              <div
                aria-label={`Progreso: pregunta ${step + 1} de ${steps.length}`}
                className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={steps.length}
                aria-valuenow={step + 1}
              >
                <div
                  className="h-full rounded-full bg-sky-700 transition-[width] duration-300 dark:bg-sky-400"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
            </header>

            <form
              className="flex flex-1 flex-col"
              onSubmit={goNext}
              noValidate
            >
              <div className="flex-1">
                <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {question.title}
                </h1>
                {question.helperText && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {question.helperText}
                  </p>
                )}

                {question.type === "radio" ? (
                  <fieldset className="mt-8 grid gap-3">
                    <legend className="sr-only">{question.title}</legend>
                    {options.map((option) => (
                      <label
                        className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          answer === option
                            ? "border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-600/15 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-100"
                            : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                        key={option}
                      >
                        <input
                          checked={answer === option}
                          className="h-4 w-4 accent-sky-700"
                          name={question.id}
                          onChange={() => updateAnswer(option)}
                          type="radio"
                          value={option}
                        />
                        {option}
                      </label>
                    ))}
                  </fieldset>
                ) : question.type === "multi" ? (
                  <fieldset className="mt-8 grid gap-3 sm:grid-cols-2">
                    <legend className="sr-only">{question.title}</legend>
                    {options.map((option) => {
                      const selected =
                        Array.isArray(answer) && answer.includes(option);
                      return (
                        <label
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            selected
                              ? "border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-100"
                              : "border-slate-200 text-slate-700 hover:border-sky-300 dark:border-slate-700 dark:text-slate-200"
                          }`}
                          key={option}
                        >
                          <input
                            checked={selected}
                            className="h-4 w-4 rounded accent-sky-700"
                            onChange={() => {
                              const current = Array.isArray(answer) ? answer : [];
                              updateAnswer(
                                selected
                                  ? current.filter((value) => value !== option)
                                  : [...current, option],
                              );
                            }}
                            type="checkbox"
                            value={option}
                          />
                          {option}
                        </label>
                      );
                    })}
                  </fieldset>
                ) : question.type === "select" ? (
                  <select
                    aria-label={question.title}
                    className={`${fieldClass} mt-8`}
                    disabled={question.disabled}
                    onChange={(event) => updateAnswer(event.target.value)}
                    value={isUnknownAnswer(answer) ? unknownAnswer : answer}
                  >
                    <option disabled value="">
                      Selecciona una opción
                    </option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : question.type === "textarea" ? (
                  <textarea
                    aria-label={question.title}
                    className={`${fieldClass} mt-8 min-h-36 resize-y`}
                    onChange={(event) => updateAnswer(event.target.value)}
                    placeholder="Escribe tu respuesta"
                    value={isUnknownAnswer(answer) ? "" : answer}
                  />
                ) : (
                  <input
                    aria-label={question.title}
                    className={`${fieldClass} mt-8`}
                    inputMode={
                      question.type === "number"
                        ? "decimal"
                        : question.inputType === "email"
                          ? "email"
                          : "text"
                    }
                    max={question.max}
                    min={question.min}
                    onChange={(event) => updateAnswer(event.target.value)}
                    placeholder={
                      question.type === "number"
                        ? "Escribe un valor numérico"
                        : "Escribe tu respuesta"
                    }
                    type="text"
                    value={isUnknownAnswer(answer) ? "" : answer}
                  />
                )}

                {question.allowUnknown !== false && (
                  <button
                    aria-pressed={isUnknownAnswer(answer)}
                    className={`mt-4 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      isUnknownAnswer(answer)
                        ? "border-sky-600 bg-sky-50 text-sky-800 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-200"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                    onClick={selectUnknown}
                    type="button"
                  >
                    No sabe / No responde
                  </button>
                )}

                {validationError && (
                  <p
                    aria-live="polite"
                    className="mt-3 text-sm font-medium text-rose-700 dark:text-rose-300"
                  >
                    {validationError}
                  </p>
                )}
              </div>

              <footer className="mt-10 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <button
                  className={secondaryButtonClass}
                  disabled={step === 0}
                  onClick={goBack}
                  type="button"
                >
                  Anterior
                </button>
                <button className={primaryButtonClass} type="submit">
                  {step === steps.length - 1 ? "Finalizar" : "Siguiente"}
                </button>
              </footer>
            </form>
          </>
        ) : null}
      </section>
    </main>
  );
};

export default Survey;
