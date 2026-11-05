import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { AuthPageLayout } from "../components/AuthPageLayout";
import { forgotPasswordSchema } from "../schemas/forgotPasswordSchema";

export const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = () => setSubmitted(true);

  return (
    <AuthPageLayout>
      <section className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
        <header className="text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
            Coopera2075
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Ingresa el correo asociado a tu cuenta para iniciar el proceso de
            recuperación.
          </p>
        </header>

        <Alert title="Integración pendiente" variant="warning">
          Esta pantalla aún no envía correos. La solicitud estará disponible
          cuando el backend publique el endpoint de recuperación.
        </Alert>

        {submitted && (
          <Alert title="Solicitud preparada" variant="info">
            El correo pasó la validación local, pero no se envió ninguna
            solicitud al servidor.
          </Alert>
        )}

        <form
          className="grid gap-5"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            autoComplete="email"
            disabled={isSubmitting}
            error={errors.email?.message}
            label="Correo electrónico"
            maxLength={150}
            placeholder="persona@ejemplo.com"
            type="email"
            {...register("email", {
              onChange: () => setSubmitted(false),
            })}
          />
          <Button disabled={isSubmitting} fullWidth size="lg" type="submit">
            Preparar solicitud
          </Button>
        </form>

        <p className="text-center text-sm">
          <Link
            className="font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-200"
            to="/login"
          >
            Volver al inicio de sesión
          </Link>
        </p>
      </section>
    </AuthPageLayout>
  );
};

export default ForgotPassword;
