import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { registerSchema } from '../schemas/registerSchema';

export const RegisterForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');

    // Payload según RegisterRequest del backend (confirmPassword no se envía)
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role,
    };
    try {
      const response = await api.post('/auth/register', payload);

      // El backend responde con el mismo AuthResponse del login (incluye el JWT)
      login(response.data);

      setSuccessMessage('Registro exitoso. Tu sesión ya está iniciada.');
      reset(); // Resetea el formulario después del registro exitoso

      // Redirige al usuario a la landing page
      navigate('/', { replace: true });
    } catch (error) {
      if (error.response) {
        const { data: errorData } = error.response;
        const errorMessage =
          (typeof errorData === 'string' ? errorData : errorData?.message) ||
          'Error en el registro. Intenta de nuevo.';
        setServerError(errorMessage);
      } else {
        setServerError('No se pudo conectar con el servidor.');
      }
    }
  };

  return (
    <div className="auth-form-shell flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="auth-form-card w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-xl sm:p-8">

        {/* Encabezado */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Regístrate para acceder a la plataforma
          </p>
        </div>

        {/* Notificaciones de éxito o error */}
        {serverError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {/* Nombre de usuario */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              disabled={isSubmitting}
              {...register('username')}
              placeholder="Ej. anagomez"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.username
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              disabled={isSubmitting}
              {...register('email')}
              placeholder="usuario@ejemplo.com"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Tipo de cuenta (rol) */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Tipo de cuenta
            </label>
            <select
              id="role"
              disabled={isSubmitting}
              {...register('role')}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.role
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            >
              <option value="">Selecciona una opción</option>
              <option value="FUNDER">Financiador (invierte en convocatorias)</option>
              <option value="MANAGER">Gestor (administra proyectos)</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              disabled={isSubmitting}
              {...register('password')}
              placeholder="••••••••"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              disabled={isSubmitting}
              {...register('confirmPassword')}
              placeholder="••••••••"
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center items-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Registrando...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>

        </form>
        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-900" to="/login">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
