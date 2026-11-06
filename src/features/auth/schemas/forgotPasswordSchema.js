import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("El correo no tiene un formato válido")
    .max(150, "El correo no puede superar 150 caracteres"),
});
