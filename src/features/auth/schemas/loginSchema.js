// loginSchema.js
import { z } from 'zod';

// Refleja LoginRequest del backend: { username, password }
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'El usuario es obligatorio')
    .max(255, 'El usuario no puede superar 255 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
  system: z.enum(["COOPERA", "ECONOMIC_UNITS"]),
}).superRefine((data, context) => {
  if (
    data.system === "COOPERA" &&
    !z.email().safeParse(data.username).success
  ) {
    context.addIssue({
      code: "custom",
      message: "Ingresa un correo electrónico válido",
      path: ["username"],
    });
  }
});
