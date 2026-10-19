// registerSchema.js
import { z } from 'zod';

// Refleja RegisterRequest del backend: { username, email, password, role }
export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'El nombre de usuario debe tener al menos 2 caracteres')
    .max(50, 'El nombre de usuario no puede superar los 50 caracteres'),
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  // Valores del enum UserRole del backend
  role: z.enum(['FUNDER', 'MANAGER'], 'Selecciona el tipo de cuenta'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar los 72 caracteres'),
  // Solo se valida en el front, no se envía al backend
  confirmPassword: z
    .string()
    .min(1, 'Debes confirmar la contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'], // Asigna el mensaje de error directamente al campo confirmPassword
});
