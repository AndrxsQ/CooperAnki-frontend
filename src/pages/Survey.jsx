import { useState } from "react";
import { useTheme } from "../context/useTheme";
import { submitSurveyResponse } from "../api/surveys";
import {
  buildSurveySteps,
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

const isAnswered = (value) =>
  Array.isArray(value)
    ? value.length > 0
    : typeof value === "string" && value.trim().length > 0;

const getQuestionValidationError = (question, answers) => {
  const answer = answers[question.id] ?? "";

  if (question.type === "repeat-number") {
    const selectedMembers = answers[question.repeatFrom];
    if (!Array.isArray(selectedMembers) || selectedMembers.length === 0) {
      return "Selecciona al menos un integrante en la pregunta anterior.";
    }
    for (const member of selectedMembers) {
      const memberIndex = question.options.indexOf(member);
      if (memberIndex < 0) {
        continue;
      }
      const value = answers[`${question.id}.${memberIndex}`];
      const error = getValidationError(
        { type: "number", min: question.min },
        value ?? "",
      );
      if (error) {
        return `Completa un número válido de horas para ${member}.`;
      }
    }
  } else if (question.type === "income-details") {
    if (question.noIncomeAvailable && answers["26.noIncome"] !== true) {
      return "Indica si no recibes ingresos directamente o completa los detalles.";
    }
    for (const source of question.incomeSources) {
      const detail = answers[`26.detail.${source.index}`];
      if (!isAnswered(detail)) {
        return `Completa los detalles de ${source.name}.`;
      }
    }
    if (question.otherIncomeEnabled) {
      for (let index = 0; index < question.otherIncomeCount; index += 1) {
        if (!isAnswered(answers[`26.otherSource.${index}`])) {
          return `Escribe el nombre del otro ingreso ${index + 1}.`;
        }
        if (!isAnswered(answers[`26.otherDetail.${index}`])) {
          return `Completa los detalles del otro ingreso ${index + 1}.`;
        }
      }
    }
  } else if (question.type === "income-amounts") {
    if (question.noIncomeAvailable && answers["26.noIncome"] !== true) {
      return "Indica si no recibes ingresos directamente o completa los montos.";
    }
    for (const source of question.incomeSources) {
      const amount = source.id.startsWith("other.")
        ? answers[`26.amount.other.${source.index}`]
        : answers[`26.amount.${source.index}`];
      const error = getValidationError(
        { type: "number", min: question.min },
        amount ?? "",
      );
      if (error) {
        return `Completa un monto válido para ${source.name}.`;
      }
    }
  } else {
    const error = getValidationError(question, answer);
    if (error) {
      return error;
    }
  }

  if (question.repeatText) {
    for (const member of Array.isArray(answer) ? answer : []) {
      if (member === "Nadie actualmente") {
        continue;
      }
      const memberIndex = question.repeatText.options.indexOf(member);
      if (
        memberIndex >= 0 &&
        !isAnswered(answers[`${question.repeatText.prefix}.${memberIndex}`])
      ) {
        return `Indica en qué tareas colabora ${member}.`;
      }
    }
  }

  for (const field of question.inlineInputs ?? []) {
    const shouldShow = Array.isArray(answer)
      ? answer.includes(field.when)
      : answer === field.when;
    if (shouldShow && !isAnswered(answers[field.id])) {
      return `Completa el campo: ${field.label}`;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const steps = buildSurveySteps(answers);

  const isWelcome = step === -1;
  const isComplete = step >= steps.length;
  const question = steps[step];
  const answer = question ? answers[question.id] ?? "" : "";
  const validationError =
    question && showValidation
      ? getQuestionValidationError(question, answers)
      : "";

  const updateStoredAnswer = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setShowValidation(false);
  };

  const updateAnswer = (value) => updateStoredAnswer(question.id, value);

  const goNext = (event) => {
    event.preventDefault();
    if (getQuestionValidationError(question, answers)) {
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
    setIsSubmitting(false);
    setSubmissionError("");
    setReceipt(null);
    setStep(-1);
  };

  const sendSurvey = async () => {
    if (isSubmitting || receipt) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");
    try {
      const savedReceipt = await submitSurveyResponse(steps, answers);
      setReceipt(savedReceipt);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "No fue posible enviar la encuesta. Revisa tu conexión e inténtalo de nuevo.";
      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectUnknown = () => {
    updateAnswer(isUnknownAnswer(answer) ? "" : unknownAnswer);
  };

  const options = question?.options ?? [];
  const selectedOption = (option) =>
    answer === option || (Array.isArray(answer) && answer.includes(option));

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
                ASOCIACION COLECTIVO MUJERES AL DERECHO
              </h1>
            </header>

            <div className="grid gap-4 rounded-xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:p-6">
              <p className="m-0">
                <strong className="text-slate-900 dark:text-slate-100">
                  OBJETIVO.
                </strong>{" "}
                Evaluar de forma rápida y estructurada la situación actual de un emprendimiento rural para
                identificar fortalezas, debilidades, riesgos y oportunidades de mejora en áreas productivas, comerciales,
                financieras, organizativas y ambientales.
              </p>
              <p className="m-0">
                <strong className="text-slate-900 dark:text-slate-100">
                  Orientaciones:
                </strong>{" "}
                Para garantizar la transparencia, efectividad y monitoreo de los datos suministrado se requiere de
                total compromiso y veracidad en cada respuesta suministrada. Pluricultural sigue una matriz
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
                ¿La participante acepta voluntariamente responder esta encuesta y
                autoriza el uso de sus datos con fines exclusivos de diagnóstico
                socioempresarial y actualización de información interna.
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
          <div className="flex flex-1 flex-col justify-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
              {receipt ? "Encuesta recibida" : "Mensaje de cierre"}
            </p>
            <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {receipt
                ? "Gracias por suministrar la información solicitada."
                : "Tu encuesta está lista para enviarse."}
            </h1>
            <div className="mt-5 grid gap-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              {receipt ? (
                <>
                  <p className="m-0">
                    El servidor recibió y almacenó tus respuestas correctamente.
                  </p>
                  <dl className="grid gap-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                    <div className="flex flex-wrap gap-2">
                      <dt className="font-semibold">Identificador:</dt>
                      <dd className="m-0">{receipt.id}</dd>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <dt className="font-semibold">Fecha de recepción:</dt>
                      <dd className="m-0">
                        {new Date(receipt.submittedAt).toLocaleString("es-CO")}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <>
                  <p className="m-0">
                    Al enviar, se guardará una copia de las preguntas presentadas
                    y de las respuestas proporcionadas.
                  </p>
                  {submissionError && (
                    <p
                      aria-live="polite"
                      className="m-0 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
                      role="alert"
                    >
                      {submissionError}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              {receipt ? (
                <button
                  className={primaryButtonClass}
                  type="button"
                  onClick={restartSurvey}
                >
                  Completar otra encuesta
                </button>
              ) : (
                <button
                  className={primaryButtonClass}
                  disabled={isSubmitting}
                  type="button"
                  onClick={sendSurvey}
                >
                  {isSubmitting ? "Enviando encuesta..." : "Enviar Respuestas"}
                </button>
              )}
            </div>
          </div>
        ) : question ? (
          <>
            <header className="mb-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300">
                {question.section}
              </p>
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                    {(isUnknownAnswer(answer) ? [...options, unknownAnswer] : options).map((option) => (
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
                ) : question.type === "repeat-number" ? (
                  <div className="mt-8 grid gap-5">
                    {(Array.isArray(answers[question.repeatFrom])
                      ? answers[question.repeatFrom]
                      : []
                    ).map((member) => {
                      const memberIndex = question.options.indexOf(member);
                      if (memberIndex < 0) {
                        return null;
                      }
                      const fieldId = `${question.id}.${memberIndex}`;
                      return (
                        <label className="grid gap-2 text-sm font-medium" key={member}>
                          <span>{member}: {question.label}</span>
                          <input
                            aria-label={`${question.label} ${member}`}
                            className={fieldClass}
                            inputMode="decimal"
                            min={question.min}
                            onChange={(event) =>
                              updateStoredAnswer(fieldId, event.target.value)
                            }
                            placeholder="Escribe un valor numérico"
                            type="number"
                            value={answers[fieldId] ?? ""}
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : question.type === "income-details" ? (
                  <div className="mt-8 grid gap-5">
                    {question.incomeSources.map((source) => (
                      <label className="grid gap-2 text-sm font-medium" key={source.id}>
                        <span>{source.name}</span>
                        <textarea
                          aria-label={`Detalles de ${source.name}`}
                          className={`${fieldClass} min-h-28 resize-y`}
                          onChange={(event) =>
                            updateStoredAnswer(
                              `26.detail.${source.index}`,
                              event.target.value,
                            )
                          }
                          placeholder="Describe los detalles de este ingreso"
                          value={answers[`26.detail.${source.index}`] ?? ""}
                        />
                      </label>
                    ))}
                    {question.noIncomeAvailable && (
                      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                        <input
                          checked={answers["26.noIncome"] === true}
                          className="h-4 w-4 accent-sky-700"
                          onChange={(event) => {
                            updateStoredAnswer("26.noIncome", event.target.checked);
                            if (event.target.checked) {
                              updateStoredAnswer("26.otherEnabled", false);
                            }
                          }}
                          type="checkbox"
                        />
                        No recibo ni controlo ingresos directamente
                      </label>
                    )}
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                      <input
                        checked={question.otherIncomeEnabled}
                        className="h-4 w-4 accent-sky-700"
                        onChange={(event) => {
                          if (event.target.checked) {
                            updateStoredAnswer("26.noIncome", false);
                          }
                          updateStoredAnswer(
                            "26.otherEnabled",
                            event.target.checked,
                          );
                          if (
                            event.target.checked &&
                            !Number.parseInt(answers["26.otherCount"] ?? "0", 10)
                          ) {
                            updateStoredAnswer("26.otherCount", "1");
                          }
                        }}
                        type="checkbox"
                      />
                      Otros
                    </label>
                    {question.otherIncomeEnabled &&
                      Array.from(
                        { length: question.otherIncomeCount },
                        (_, index) => (
                          <div className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700" key={index}>
                            <label className="grid gap-2 text-sm font-medium">
                              <span>Nombre del otro ingreso</span>
                              <input
                                aria-label={`Nombre del otro ingreso ${index + 1}`}
                                className={fieldClass}
                                onChange={(event) =>
                                  updateStoredAnswer(
                                    `26.otherSource.${index}`,
                                    event.target.value,
                                  )
                                }
                                placeholder="Escribe el nombre del ingreso"
                                value={answers[`26.otherSource.${index}`] ?? ""}
                              />
                            </label>
                            <label className="grid gap-2 text-sm font-medium">
                              <span>Detalles del ingreso</span>
                              <textarea
                                aria-label={`Detalles del otro ingreso ${index + 1}`}
                                className={`${fieldClass} min-h-28 resize-y`}
                                onChange={(event) =>
                                  updateStoredAnswer(
                                    `26.otherDetail.${index}`,
                                    event.target.value,
                                  )
                                }
                                placeholder="Describe los detalles de este ingreso"
                                value={answers[`26.otherDetail.${index}`] ?? ""}
                              />
                            </label>
                          </div>
                        ),
                      )}
                    {question.otherIncomeEnabled && (
                      <button
                        className={secondaryButtonClass}
                        onClick={() =>
                          updateStoredAnswer(
                            "26.otherCount",
                            String(question.otherIncomeCount + 1),
                          )
                        }
                        type="button"
                      >
                        Añadir otro ingreso
                      </button>
                    )}
                  </div>
                ) : question.type === "income-amounts" ? (
                  <div className="mt-8 grid gap-5">
                    {question.incomeSources.map((source) => {
                      const fieldId =
                        source.id.startsWith("other.")
                          ? `26.amount.other.${source.index}`
                          : `26.amount.${source.index}`;
                      return (
                        <label className="grid gap-2 text-sm font-medium" key={source.id}>
                          <span>{source.name}</span>
                          <input
                            aria-label={`Monto mensual de ${source.name}`}
                            className={fieldClass}
                            inputMode="decimal"
                            min={question.min}
                            onChange={(event) =>
                              updateStoredAnswer(fieldId, event.target.value)
                            }
                            placeholder="Escribe el monto mensual"
                            type="number"
                            value={answers[fieldId] ?? ""}
                          />
                        </label>
                      );
                    })}
                    {question.noIncomeAvailable && (
                      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                        <input
                          checked={answers["26.noIncome"] === true}
                          className="h-4 w-4 accent-sky-700"
                          onChange={(event) =>
                            updateStoredAnswer("26.noIncome", event.target.checked)
                          }
                          type="checkbox"
                        />
                        No recibo ni controlo ingresos directamente
                      </label>
                    )}
                  </div>
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
                    type={question.inputType ?? "text"}
                    value={isUnknownAnswer(answer) ? "" : answer}
                  />
                )}

                {question.inlineInputs
                  ?.filter((field) => selectedOption(field.when))
                  .map((field) => (
                    <label
                      className="mt-5 grid gap-2 text-sm font-medium"
                      key={field.id}
                    >
                      <span>{field.label}</span>
                      {field.type === "textarea" ? (
                        <textarea
                          aria-label={field.label}
                          className={`${fieldClass} min-h-28 resize-y`}
                          onChange={(event) =>
                            updateStoredAnswer(field.id, event.target.value)
                          }
                          placeholder={field.placeholder ?? "Escribe tu respuesta"}
                          value={answers[field.id] ?? ""}
                        />
                      ) : (
                        <input
                          aria-label={field.label}
                          className={fieldClass}
                          onChange={(event) =>
                            updateStoredAnswer(field.id, event.target.value)
                          }
                          placeholder={field.placeholder ?? "Escribe tu respuesta"}
                          type="text"
                          value={answers[field.id] ?? ""}
                        />
                      )}
                    </label>
                  ))}

                {question.repeatText &&
                  (Array.isArray(answer) ? answer : [])
                    .filter((member) => member !== "Nadie actualmente")
                    .map((member) => {
                      const memberIndex =
                        question.repeatText.options.indexOf(member);
                      if (memberIndex < 0) {
                        return null;
                      }
                      const fieldId =
                        `${question.repeatText.prefix}.${memberIndex}`;
                      return (
                        <label
                          className="mt-5 grid gap-2 text-sm font-medium"
                          key={member}
                        >
                          <span>{member}: {question.repeatText.label}</span>
                          <input
                            aria-label={`${question.repeatText.label} ${member}`}
                            className={fieldClass}
                            onChange={(event) =>
                              updateStoredAnswer(fieldId, event.target.value)
                            }
                            placeholder="Escribe tu respuesta"
                            type="text"
                            value={answers[fieldId] ?? ""}
                          />
                        </label>
                      );
                    })}

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
