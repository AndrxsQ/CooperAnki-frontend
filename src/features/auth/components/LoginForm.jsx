import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../context/useAuth';
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
          <Alert className="mb-5" variant="error">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
          <Input
            autoComplete="username"
            disabled={isSubmitting}
            error={errors.username?.message}
            label="Nombre de usuario"
            placeholder="Ej. anagomez"
            type="text"
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
      </section>
  );
};