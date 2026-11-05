import { Link } from "react-router-dom";
import { Alert } from "../../../components/ui/Alert";
import { AuthPageLayout } from "../components/AuthPageLayout";

export const EmailConfirmation = () => (
  <AuthPageLayout>
    <section className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
      <header className="text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
          Coopera2075
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          Confirmación de correo
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Aquí podrás confirmar la dirección de correo de tu cuenta desde el
          enlace que recibas.
        </p>
      </header>

      <Alert title="Verificación pendiente" variant="warning">
        El backend todavía no dispone de un endpoint para validar el enlace.
        Esta pantalla no confirma ni modifica el estado de ninguna cuenta.
      </Alert>

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

export default EmailConfirmation;
