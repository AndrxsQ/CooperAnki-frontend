import { z } from "zod";

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : Number(value)),
  z
    .number()
    .int("El identificador debe ser un número entero")
    .positive("El identificador debe ser un número positivo")
    .optional(),
);

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(150, "El nombre no puede superar 150 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio")
      .email("El correo no tiene un formato válido")
      .max(150, "El correo no puede superar 150 caracteres"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "La contraseña no puede superar 72 caracteres")
      .refine(
        (password) => new TextEncoder().encode(password).length <= 72,
        "La contraseña no puede superar 72 bytes",
      ),
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
    roleId: z.preprocess(
      (value) => (value === "" || value === undefined ? undefined : Number(value)),
      z.number({
        error: "Selecciona un rol",
      }).int("Selecciona un rol válido").positive("Selecciona un rol válido"),
    ),
    organizationId: optionalPositiveInteger,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
