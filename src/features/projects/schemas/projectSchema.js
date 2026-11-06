import { z } from "zod";

const optionalDateTime = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().datetime({ local: true }).optional(),
);

export const projectSchema = z
  .object({
    organizationId: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : Number(value)),
      z.number({
        error: "Selecciona una organización",
      }).int("Selecciona una organización válida").positive("Selecciona una organización válida"),
    ),
    identifierCode: z
      .string()
      .trim()
      .min(1, "El código del proyecto es obligatorio")
      .max(50, "El código no puede superar 50 caracteres"),
    title: z
      .string()
      .trim()
      .min(1, "El título del proyecto es obligatorio")
      .max(255, "El título no puede superar 255 caracteres"),
    executiveSummary: z
      .string()
      .max(10000, "El resumen no puede superar 10000 caracteres"),
    requestedBudget: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : Number(value)),
      z
        .number({ error: "Ingresa un presupuesto válido" })
        .positive("El presupuesto debe ser mayor que cero")
        .optional(),
    ),
    startsAt: optionalDateTime,
    closesAt: optionalDateTime,
  })
  .superRefine((project, context) => {
    if (
      project.startsAt &&
      project.closesAt &&
      new Date(project.closesAt) <= new Date(project.startsAt)
    ) {
      context.addIssue({
        code: "custom",
        message: "La fecha de cierre debe ser posterior a la fecha de inicio",
        path: ["closesAt"],
      });
    }
  });
