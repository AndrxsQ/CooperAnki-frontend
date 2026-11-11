import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import api from '../../../api/axios';
import { getUserFacingErrorMessage } from '../../../api/httpErrors';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../context/useToast';
import { useAuth } from '../../../context/useAuth';
import {
  canAccessSubsystem,
  getDefaultHome,
  getSubsystemFromPath,
} from '../../../config/subsystems';
import { loginSchema } from '../schemas/loginSchema';

export const LoginForm = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Configuración de REact Hook Form con Zod para validación
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  // Solo se ejecuta si la validación de Zod pasa
  const onSubmit = async (data) => {
    clearErrors();
    try {
      // The LoginRequest accepts an optional system to disambiguate accounts.
      const response = await api.post('/auth/login', data);

      const authenticatedUser = login(response.data);

      // La raíz del rol define el subsistema inicial; una solicitud previa solo
      // se respeta cuando el rol tiene acceso a ese subsistema.
      const previousLocation = location.state?.from;
      const previousSubsystem = previousLocation
        ? getSubsystemFromPath(previousLocation.pathname)
        : null;
      const destination =
        previousSubsystem &&
        canAccessSubsystem(authenticatedUser.role, previousSubsystem)
          ? `${previousLocation.pathname}${previousLocation.search ?? ''}${previousLocation.hash ?? ''}`
          : getDefaultHome(authenticatedUser.role) ?? '/';
      navigate(destination, { replace: true });
    } catch (error) {
      const fieldErrors = error?.fieldErrors ?? error?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (
            ["username", "password"].includes(field) &&
            typeof message === "string"
          ) {
            setError(field, { type: "server", message });
          }
        });
      }

      if (!error?.isAxiosError) {
        addToast({
          message: getUserFacingErrorMessage(
            error,
            "No fue posible iniciar sesión. Intenta de nuevo.",
          ),
        });
      }
    }
  };

  return (
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-7 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
            Cooperación
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Sistema
            </span>
            <select
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              disabled={isSubmitting}
              {...register("system")}
            >
              <option value="COOPERA">Cooperación</option>
              <option value="ECONOMIC_UNITS">Gestión de Información</option>
            </select>
          </label>

          <Input
            autoComplete="username"
            disabled={isSubmitting}
            error={errors.username?.message}
            label="Correo electrónico"
            placeholder="persona@ejemplo.com"
            type="email"
            {...register('username')}
          />

          <Input
            autoComplete="current-password"
            disabled={isSubmitting}
            error={errors.password?.message}
            label="Contraseña"
            placeholder="••••••••"
            type="password"
            {...register('password')}
          />

          <Button
            className="mt-1"
            type="submit"
            disabled={isSubmitting}
            fullWidth
            size="lg"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          <Link
            className="font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
            to="/forgot-password"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link
            className="font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            to="/email-confirmation"
          >
            Confirmar correo
          </Link>
        </div>
      </section>
  );
};