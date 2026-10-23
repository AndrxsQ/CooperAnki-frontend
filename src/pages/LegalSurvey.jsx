import { useState } from "react";
import { useTheme } from "../context/useTheme";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-700 px-5 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:outline-sky-400";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";
const fieldClass =
  "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400";

const sections = {
  identification: "SECCIÓN 1. IDENTIFICACIÓN PERSONAL",
  case: "SECCIÓN 2. INFORMACIÓN DE SU CASO Y EXPEDIENTE INDIVIDUAL",
  update: "SECCIÓN 3. ACTUALIZACIÓN Y VERIFICACIÓN DE INFORMACIÓN",
  payment: "SECCIÓN 4. LIQUIDACIÓN DEL TRÁMITE Y SOPORTE DE PAGO",
};

const yesNo = ["Sí.", "No."];
const yesNoDontKnow = ["Sí.", "No.", "No recuerda."];

const validateQuestion = (question, answer) => {
  if (
    question.type === "email" &&
    answer &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)
  ) {
    return "Ingresa un correo electrónico válido.";
  }
  return "";
};

const getQuestions = (answers) => {
  const questions = [
    {
      id: "1",
      section: sections.identification,
      title: "Nombres y apellidos completos.",
      type: "text",
    },
    {
      id: "2",
      section: sections.identification,
      title: "Tipo de documento de identidad.",
      type: "radio",
      options: ["Cédula de ciudadanía.", "Cédula de extranjería.", "Otro."],
    },
    {
      id: "3",
      section: sections.identification,
      title: "Número de documento de identidad.",
      type: "text",
    },
    {
      id: "4",
      section: sections.identification,
      title: "Municipio y departamento de residencia actual.",
      type: "text",
    },
    {
      id: "5",
      section: sections.identification,
      title: "Dirección de residencia o lugar de contacto.",
      type: "text",
    },
    {
      id: "8",
      section: sections.identification,
      title: "Correo electrónico personal.",
      helperText: "Si dispone de correo electrónico, por favor indíquelo.",
      type: "email",
    },
    {
      id: "9",
      section: sections.identification,
      title: "¿A qué organización o proceso colectivo pertenece?",
      type: "radio",
      options: [
        "ASOMUPROCA.",
        "Otra organización acompañada por ASOCOLEMAD.",
        "Acompañamiento individual.",
        "Otra.",
      ],
    },
    {
      id: "10",
      section: sections.identification,
      title:
        "¿Ha cambiado alguno de sus datos de contacto desde la última vez que se comunicó con ASOCOLEMAD?",
      type: "radio",
      options: yesNo,
    },
  ];

  if (answers["10"] === "Sí.") {
    questions.push({
      id: "10-detail",
      section: sections.identification,
      title: "Si respondió sí, indique cuáles datos cambiaron.",
      type: "textarea",
    });
  }

  questions.push(
    {
      id: "11",
      section: sections.case,
      title:
        "¿Qué procesos o asuntos jurídicos recuerda que ASOCOLEMAD ha acompañado, representado o gestionado en su caso?",
      type: "multi",
      options: [
        "Acción de tutela.",
        "Acción de grupo.",
        "Restitución de tierras.",
        "Reparación colectiva.",
        "Ayuda o asistencia humanitaria.",
        "Indemnización administrativa.",
        "Solicitud de protección.",
        "Derechos de petición y otras actuaciones administrativas.",
        "Seguimiento al cumplimiento de sentencias u órdenes judiciales.",
        "Otro proceso o trámite.",
        "No recuerda cuáles son sus procesos.",
      ],
    },
    {
      id: "12",
      section: sections.case,
      title:
        "¿Ha recibido información reciente sobre el estado de sus procesos por parte de alguna entidad estatal o autoridad judicial?",
      type: "radio",
      options: yesNoDontKnow,
    },
  );

  if (answers["12"] === "Sí.") {
    questions.push({
      id: "12-detail",
      section: sections.case,
      title:
        "Indique qué entidad se comunicó con usted y qué información recibió.",
      type: "textarea",
    });
  }

  questions.push(
    {
      id: "13",
      section: sections.case,
      title:
        "¿Tiene conocimiento de alguna medida, beneficio u orden judicial que esté pendiente de cumplimiento en su caso?",
      helperText:
        "Describa brevemente lo que conoce. Si no tiene esa información, indíquelo.",
      type: "textarea",
    },
    {
      id: "14",
      section: sections.case,
      title:
        "¿Ha cambiado alguna circunstancia personal, familiar o territorial que considere importante para la continuidad de sus procesos?",
      type: "radio",
      options: [
        "Sí.",
        "No.",
        "Prefiero informarlo directamente a las abogadas.",
      ],
    },
  );

  if (answers["14"] === "Sí.") {
    questions.push({
      id: "14-detail",
      section: sections.case,
      title:
        "Si respondió sí y desea compartirlo, describa brevemente la situación.",
      type: "textarea",
    });
  }

  questions.push(
    {
      id: "15",
      section: sections.update,
      title:
        "¿Confirma que los datos suministrados en este formulario corresponden a su información actual?",
      type: "radio",
      options: [
        "Sí, la información está actualizada.",
        "No, algunos datos están pendientes de actualización.",
      ],
    },
    {
      id: "16",
      section: sections.update,
      title:
        "¿Cuál es el medio de comunicación por el que prefiere recibir información sobre sus procesos?",
      type: "radio",
      options: [
        "WhatsApp.",
        "Llamada telefónica.",
        "Correo electrónico.",
        "Otro.",
      ],
    },
    {
      id: "17",
      section: sections.update,
      title:
        "¿Tiene disponibilidad para comunicarse directamente con las abogadas de ASOCOLEMAD y coordinar una revisión individual de sus procesos?",
      type: "radio",
      options: [
        "Sí.",
        "Necesito acordar una fecha.",
        "Requiero apoyo para comunicarme.",
      ],
    },
    {
      id: "18",
      section: sections.payment,
      title:
        "¿Realizó el pago correspondiente al trámite de liquidación de sus procesos?",
      type: "radio",
      options: [
        "Sí, ya realicé el pago.",
        "No, aún no he realizado el pago.",
        "Necesito comunicarme con las abogadas para aclarar información sobre el trámite.",
      ],
    },
  );

  if (answers["18"] === "Sí, ya realicé el pago.") {
    questions.push(
      {
        id: "19",
        section: sections.payment,
        title:
          "Si realizó el pago, adjunte el volante o comprobante de pago correspondiente.",
        helperText:
          "Adjunte una fotografía legible o un archivo PDF del volante o comprobante que permita verificar el pago realizado. Formatos permitidos: PDF, JPG o PNG.",
        type: "file",
      },
      {
        id: "20",
        section: sections.payment,
        title: "Indique la fecha en que realizó el pago.",
        type: "date",
      },
    );
  }

  return questions;
};

const LegalSurvey = () => {
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentFileError, setPaymentFileError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const questions = getQuestions(answers);

  const isWelcome = step === -1;
  const isComplete = step >= questions.length;
  const question = questions[step];
  const answer = question ? answers[question.id] ?? "" : "";
  const validationError =
    question && showValidation
      ? validateQuestion(question, answer)
      : "";

  const updateAnswer = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    if (
      question.id === "18" &&
      value !== "Sí, ya realicé el pago."
    ) {
      setPaymentFile(null);
      setPaymentFileError("");
    }
    setShowValidation(false);
  };

  const goNext = (event) => {
    event.preventDefault();
    if (validateQuestion(question, answer)) {
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
    setPaymentFile(null);
    setPaymentFileError("");
    setShowValidation(false);
    setStep(-1);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setPaymentFile(null);
      setPaymentFileError("");
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExtensions = /\.(pdf|jpe?g|png)$/i;
    if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
      setPaymentFile(null);
      setPaymentFileError("Selecciona un archivo PDF, JPG o PNG.");
      event.target.value = "";
      return;
    }

    setPaymentFile(file);
    setPaymentFileError("");
    setShowValidation(false);
  };

  const updateMultiAnswer = (option) => {
    const selected = Array.isArray(answer) ? answer : [];
    updateAnswer(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  };

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
          <svg aria-hidden="true" className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </svg>
        ) : (
          <svg aria-hidden="true" className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24">
            <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
          </svg>
        )}
      </button>

      <section
        aria-label="Encuesta de actualización jurídica"
        className={`flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 sm:p-10 ${
          isWelcome || isComplete
            ? "my-auto max-h-[calc(100vh-2rem)] max-w-4xl overflow-y-auto"
            : "min-h-[min(620px,calc(100vh-4rem))] max-w-3xl"
        }`}
      >
        {isWelcome ? (
          <div className="grid gap-6 text-center">
            <header className="grid gap-3">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                ASOCOLEMAD
              </p>
              <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Actualización de información jurídica
              </h1>
            </header>
            <p className="m-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Este formulario permite actualizar sus datos de contacto,
              recopilar información sobre sus procesos y coordinar el
              seguimiento individual de su caso con el equipo jurídico de
              ASOCOLEMAD.
            </p>
            <p className="m-0 text-xs text-slate-500 dark:text-slate-400">
              Sus respuestas y archivos permanecerán únicamente en esta sesión;
              no se envían ni se guardan en esta versión.
            </p>
            <div className="flex justify-center">
              <button
                className={primaryButtonClass}
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
              Mensaje de cierre
            </p>
            <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Gracias por suministrar la información solicitada.
            </h1>
            <div className="mt-5 grid gap-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              <p className="m-0">
                Si realizó el pago correspondiente al trámite de liquidación,
                recuerde adjuntar el volante o comprobante para facilitar su
                verificación.
              </p>
              <p className="m-0">
                Una vez diligenciado el formulario, deberá comunicarse
                directamente con las abogadas de ASOCOLEMAD para coordinar la
                revisión integral de su expediente individual y conocer el
                estado de los procesos judiciales y administrativos relacionados
                con su caso, las actuaciones realizadas, las medidas reconocidas
                y las gestiones pendientes.
              </p>
              <p className="m-0">
                La información suministrada permitirá organizar el seguimiento
                individual y facilitar la comunicación directa con el equipo
                jurídico.
              </p>
            </div>
            <div className="mt-7 grid gap-2">
              <label
                className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                htmlFor="legal-payment-receipt-final"
              >
                Adjuntar volante o comprobante de pago (opcional)
              </label>
              <input
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                aria-describedby="legal-payment-receipt-final-help"
                className={`${fieldClass} file:mr-4 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-sky-800 hover:file:bg-sky-200 dark:file:bg-sky-950 dark:file:text-sky-200 dark:hover:file:bg-sky-900`}
                id="legal-payment-receipt-final"
                onChange={handleFileChange}
                type="file"
              />
              {paymentFile && (
                <p className="m-0 text-sm text-slate-700 dark:text-slate-300">
                  Archivo seleccionado: {paymentFile.name}
                </p>
              )}
              {paymentFileError && (
                <p
                  aria-live="polite"
                  className="m-0 text-sm font-medium text-rose-700 dark:text-rose-300"
                >
                  {paymentFileError}
                </p>
              )}
              <p
                className="m-0 text-xs leading-relaxed text-slate-500 dark:text-slate-400"
                id="legal-payment-receipt-final-help"
              >
                Formatos permitidos: PDF, JPG o PNG. El archivo permanece solo
                en esta sesión y no se carga ni se envía.
              </p>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              La información y el archivo seleccionado no se guardan en esta
              versión.
            </p>
            <div className="mt-8 flex justify-end">
              <button className={primaryButtonClass} type="button" onClick={restartSurvey}>
                Enviar Respuestas
              </button>
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
                  Pregunta {step + 1} de {questions.length}
                </span>
                <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
              </div>
              <div
                aria-label={`Progreso: pregunta ${step + 1} de ${questions.length}`}
                className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={questions.length}
                aria-valuenow={step + 1}
              >
                <div
                  className="h-full rounded-full bg-sky-700 transition-[width] duration-300 dark:bg-sky-400"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </div>
            </header>

            <form className="flex flex-1 flex-col" onSubmit={goNext} noValidate>
              <div className="flex-1">
                <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {question.title}
                </h1>
                {question.helperText && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {question.helperText}
                  </p>
                )}

                {question.type === "radio" || question.type === "multi" ? (
                  <fieldset
                    className={`mt-8 grid gap-3 ${
                      question.type === "multi" ? "sm:grid-cols-2" : ""
                    }`}
                  >
                    <legend className="sr-only">{question.title}</legend>
                    {question.options.map((option) => {
                      const selected =
                        question.type === "multi"
                          ? Array.isArray(answer) && answer.includes(option)
                          : answer === option;
                      return (
                        <label
                          className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            selected
                              ? "border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-600/15 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-100"
                              : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                          }`}
                          key={option}
                        >
                          <input
                            checked={selected}
                            className="h-4 w-4 accent-sky-700"
                            name={question.id}
                                    onChange={() =>
                                      question.type === "multi"
                                        ? updateMultiAnswer(option)
                                        : updateAnswer(option)
                                    }
                                    type={question.type === "multi" ? "checkbox" : "radio"}
                                    value={option}
                                  />
                          {option}
                        </label>
                      );
                    })}
                  </fieldset>
                ) : question.type === "textarea" ? (
                  <textarea
                    aria-label={question.title}
                    className={`${fieldClass} mt-8 min-h-36 resize-y`}
                    onChange={(event) => updateAnswer(event.target.value)}
                    placeholder="Escriba su respuesta"
                    value={answer}
                  />
                ) : question.type === "file" ? (
                  <div className="mt-8 grid gap-2">
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      aria-label={question.title}
                      aria-describedby="legal-payment-file-help"
                      className={`${fieldClass} file:mr-4 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-sky-800 hover:file:bg-sky-200 dark:file:bg-sky-950 dark:file:text-sky-200 dark:hover:file:bg-sky-900`}
                      id="legal-payment-file"
                      onChange={handleFileChange}
                      type="file"
                    />
                    {paymentFile && (
                      <p className="m-0 text-sm text-slate-700 dark:text-slate-300">
                        Archivo seleccionado: {paymentFile.name}
                      </p>
                    )}
                    {paymentFileError && (
                      <p
                        aria-live="polite"
                        className="m-0 text-sm font-medium text-rose-700 dark:text-rose-300"
                      >
                        {paymentFileError}
                      </p>
                    )}
                    <p
                      className="m-0 text-xs text-slate-500 dark:text-slate-400"
                      id="legal-payment-file-help"
                    >
                      Formatos permitidos: PDF, JPG o PNG.
                    </p>
                  </div>
                ) : (
                  <input
                    aria-label={question.title}
                    className={`${fieldClass} mt-8`}
                    onChange={(event) => updateAnswer(event.target.value)}
                    placeholder={
                      question.type === "date"
                        ? undefined
                        : "Escriba su respuesta"
                    }
                    type={question.type}
                    value={answer}
                  />
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
                  {step === questions.length - 1 ? "Finalizar" : "Siguiente"}
                </button>
              </footer>
            </form>
          </>
        ) : null}
      </section>
    </main>
  );
};

export default LegalSurvey;
