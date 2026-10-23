import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { loginSchema } from '../schemas/loginSchema';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  // Configuración de REact Hook Form con Zod para validación
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  // Solo se ejecuta si la validación de Zod pasa
  const onSubmit = async (data) => {
    setServerError(''); // Limpiamos errores previos
    try {
      // data coincide con LoginRequest del backend: { username, password }
      const response = await api.post('/auth/login', data);

      login(response.data);

      const previousLocation = location.state?.from;
      const destination = previousLocation
        ? `${previousLocation.pathname}${previousLocation.search ?? ''}${previousLocation.hash ?? ''}`
        : '/';
      navigate(destination, { replace: true });
    } catch (error) {
      if(error.response){
        const message = error.response.data?.message || 'Credenciales incorrectas. Intenta de nuevo.';
        setServerError(message);
      } else {
        const message = error.message || 'Error en el servidor. Intenta de nuevo.';
        setServerError(message);
      }
    }
  };

  return (
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-7 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
            Coopera2075
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {serverError && (
          <div
            aria-live="polite"
            className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
          <div className="grid gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              disabled={isSubmitting}
              {...register('username')}
              placeholder="Ej. anagomez"
              autoComplete="username"
              className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${
                errors.username
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500'
                  : 'border-slate-300 focus:border-sky-700 focus:ring-sky-700/15 dark:border-slate-700 dark:focus:border-sky-400'
              }`}
            />
            {errors.username && (
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              disabled={isSubmitting}
              {...register('password')}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${
                errors.password
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500'
                  : 'border-slate-300 focus:border-sky-700 focus:ring-sky-700/15 dark:border-slate-700 dark:focus:border-sky-400'
              }`}
            />
            {errors.password && (
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:outline-sky-400"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        <Link
          to="/survey"
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-sky-700 px-4 text-sm font-semibold text-sky-800 transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:border-sky-400 dark:text-sky-300 dark:hover:bg-slate-800 dark:focus-visible:outline-sky-400"
        >
          Ir a la encuesta
        </Link>
      </section>
  );
};