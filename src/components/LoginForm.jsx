import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { loginSchema } from '../schemas/loginSchema';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
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

      alert('Inicio de sesión exitoso');
      navigate('/', { replace: true });
    } catch (error) {
      if(error.response){
        const message = error.response.data?.message || 'Credenciales incorrectas. Intenta de nuevo.';
        setServerError(message);
      } else {
        const message = 'Error en el servidor. Intenta de nuevo.';
        setServerError(message);
      }
    }
  };

  return (
    <div className="auth-form-shell flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="auth-form-card w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        
        {/* Encabezado del Formulario */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {/* Alerta si el Backend retorna error */}
        {serverError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {serverError}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          
          {/* Campo Nombre de usuario */}
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
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Campo Contraseña */}
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
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          ¿Aún no tienes cuenta?{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-900" to="/register">
            Créala aquí
          </Link>
        </p>
      </div>
    </div>
  );
};