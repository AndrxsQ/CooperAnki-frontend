// loginSchema.js
import { z } from 'zod';

// Refleja LoginRequest del backend: { username, password }
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'El nombre de usuario es obligatorio'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
});
