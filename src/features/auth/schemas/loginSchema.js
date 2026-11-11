// loginSchema.js
import { z } from 'zod';

// Refleja LoginRequest del backend: { username, password }. El subsistema de
// destino se determina por el rol del usuario, no se elige en el formulario.
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'El usuario es obligatorio')
    .max(255, 'El usuario no puede superar 255 caracteres')
    .refine((value) => z.email().safeParse(value).success, {
      message: 'Ingresa un correo electrónico válido',
    }),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
});
