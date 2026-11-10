import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../context/useAuth";
import { useToast } from "../../../context/useToast";
import {
  getMyAccount,
  updateEmailNotifications,
  updateMyAccount,
  updateMyPassword,
} from "../api/account";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7";
const headingClass =
  "text-lg font-bold text-slate-900 dark:text-slate-100";

const ClientAccount = () => {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getMyAccount(controller.signal)
      .then((data) => {
        setAccount(data);
        updateUser(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [loadAttempt, updateUser]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setProfileError("");
    const formData = new FormData(form);
    const updatedEmail = String(formData.get("email") ?? "").trim();
    const updatedName = String(formData.get("fullName") ?? "").trim();
    const currentPassword = String(formData.get("currentPassword") ?? "");

    if (!updatedName || !updatedEmail || !currentPassword) {
      setProfileError("Completa todos los campos para guardar los cambios.");
      return;
    }

    setSavingProfile(true);
    try {
      const updatedAccount = await updateMyAccount({
        fullName: updatedName,
        email: updatedEmail,
        currentPassword,
      });
      setAccount(updatedAccount);
      if (updatedEmail.toLowerCase() !== account.email.toLowerCase()) {
        addToast({
          message: "El correo fue actualizado. Inicia sesión nuevamente.",
          variant: "success",
        });
        await logout({ revoke: false });
        navigate("/login", { replace: true });
        return;
      }
      updateUser(updatedAccount);
      addToast({ message: "Los datos de tu cuenta fueron actualizados.", variant: "success" });
      form.elements.namedItem("currentPassword").value = "";
    } catch (error) {
      setProfileError(
        getUserFacingErrorMessage(error, "No fue posible actualizar la cuenta."),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNotificationChange = async (event) => {
    const enabled = event.target.checked;
    setSavingPreference(true);
    try {
      const updatedAccount = await updateEmailNotifications(enabled);
      setAccount(updatedAccount);
      updateUser(updatedAccount);
      addToast({
        message: "Se actualizó tu preferencia de notificaciones.",
        variant: "success",
      });
    } catch (error) {
      addToast({
        message: getUserFacingErrorMessage(
          error,
          "No fue posible actualizar las notificaciones.",
        ),
      });
    } finally {
      setSavingPreference(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < 8 || newPassword.length > 72) {
      setPasswordError("La nueva contraseña debe tener entre 8 y 72 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setSavingPassword(true);
    try {
      await updateMyPassword({ currentPassword, newPassword });
      addToast({
        message: "La contraseña fue actualizada. Inicia sesión nuevamente.",
        variant: "success",
      });
      await logout({ revoke: false });
      navigate("/login", { replace: true });
    } catch (error) {
      setPasswordError(
        getUserFacingErrorMessage(error, "No fue posible actualizar la contraseña."),
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center text-sm text-slate-600 dark:text-slate-300">
        Cargando información de tu cuenta...
      </div>
    );
  }

  if (loadError || !account) {
    return (
      <section className={cardClass}>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          No se pudo cargar tu cuenta
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Verifica tu conexión e inténtalo de nuevo.
        </p>
        <Button
          className="mt-5"
          onClick={() => {
            setLoadError(false);
            setLoading(true);
            setLoadAttempt((attempt) => attempt + 1);
          }}
        >
          Reintentar
        </Button>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="mb-1">
        <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
          Hola, {account.fullName || user?.name}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Cuenta
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Administra tu información personal y las preferencias de tu cuenta.
        </p>
      </header>

      <section aria-labelledby="account-details-heading" className={cardClass}>
        <h2 className={headingClass} id="account-details-heading">
          Información de la cuenta
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              ID de cuenta
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {account.id}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Rol
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {account.role}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Estado
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {account.active ? "Activa" : "Inactiva"}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="edit-account-heading" className={cardClass}>
        <h2 className={headingClass} id="edit-account-heading">
          Datos personales
        </h2>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
          <Input
            autoComplete="name"
            defaultValue={account.fullName}
            disabled={savingProfile}
            label="Nombre completo"
            maxLength={150}
            name="fullName"
            required
          />
          <Input
            autoComplete="email"
            defaultValue={account.email}
            disabled={savingProfile}
            label="Correo electrónico"
            maxLength={150}
            name="email"
            required
            type="email"
          />
          <div className="sm:col-span-2">
            <Input
              autoComplete="current-password"
              disabled={savingProfile}
              label="Confirma con tu contraseña actual"
              name="currentPassword"
              required
              type="password"
            />
          </div>
          {profileError && (
            <p className="text-sm text-rose-700 dark:text-rose-300 sm:col-span-2" role="alert">
              {profileError}
            </p>
          )}
          <div className="sm:col-span-2">
            <Button disabled={savingProfile} type="submit">
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </section>

      <section aria-labelledby="preferences-heading" className={cardClass}>
        <h2 className={headingClass} id="preferences-heading">
          Configuraciones
        </h2>
        <label className="mt-5 flex cursor-pointer items-start gap-3">
          <input
            checked={account.emailNotificationsEnabled}
            className="mt-1 h-4 w-4 accent-[#087ca6]"
            disabled={savingPreference}
            onChange={handleNotificationChange}
            type="checkbox"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              Notificaciones por correo electrónico
            </span>
            <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
              Recibir comunicaciones de tu cuenta por correo.
            </span>
          </span>
        </label>
      </section>

      <section aria-labelledby="password-heading" className={cardClass}>
        <h2 className={headingClass} id="password-heading">
          Cambiar contraseña
        </h2>
        <form className="mt-5 grid gap-4 sm:max-w-xl" onSubmit={handlePasswordSubmit}>
          <Input
            autoComplete="current-password"
            disabled={savingPassword}
            label="Contraseña actual"
            name="currentPassword"
            required
            type="password"
          />
          <Input
            autoComplete="new-password"
            disabled={savingPassword}
            label="Nueva contraseña"
            maxLength={72}
            minLength={8}
            name="newPassword"
            required
            type="password"
          />
          <Input
            autoComplete="new-password"
            disabled={savingPassword}
            label="Confirmar nueva contraseña"
            maxLength={72}
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
          {passwordError && (
            <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
              {passwordError}
            </p>
          )}
          <Button disabled={savingPassword} type="submit">
            {savingPassword ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default ClientAccount;
