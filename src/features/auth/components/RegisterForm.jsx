import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useToast } from "../../../context/useToast";
import { getAvailableRoles, createUser } from "../api/auth";
import { VALID_ROLE_IDS } from "../../../config/subsystems";
import { registerSchema } from "../schemas/registerSchema";

const defaultValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  roleId: "",
  organizationId: "",
};

export const RegisterForm = () => {
  const { addToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [rolesStatus, setRolesStatus] = useState({
    key: 0,
    status: "loading",
    message: "",
  });
  const [retryRoles, setRetryRoles] = useState(0);
  const [createdUser, setCreatedUser] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues,
  });

  useEffect(() => {
    const controller = new AbortController();

    getAvailableRoles(controller.signal)
      .then((availableRoles) => {
        if (!controller.signal.aborted) {
          // Solo se ofrecen los cinco roles habilitados en la plataforma.
          setRoles(
            availableRoles.filter((role) =>
              VALID_ROLE_IDS.includes(String(role.name).toUpperCase()),
            ),
          );
          setRolesStatus({
            key: retryRoles,
            status: "success",
            message: "",
          });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRoles([]);
          setRolesStatus({
            key: retryRoles,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudieron cargar los roles disponibles.",
            ),
          });
        }
      });

    return () => controller.abort();
  }, [retryRoles]);
  const rolesLoading =
    rolesStatus.key !== retryRoles || rolesStatus.status === "loading";

  const onSubmit = async (data) => {
    clearErrors();
    setCreatedUser(null);

    try {
      const user = await createUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        roleId: data.roleId,
        organizationId: data.organizationId,
      });

      setCreatedUser(user);
      reset(defaultValues);
    } catch (error) {
      const fieldErrors = error?.fieldErrors ?? error?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (
            ["fullName", "email", "password", "roleId", "organizationId"].includes(
              field,
            ) &&
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
            "No fue posible registrar la cuenta.",
          ),
        });
      }
    }
  };

  return (
    <div className="flex w-full justify-center">
      <section className="w-full max-w-xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
        <header className="text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
            Coopera2075 · Administración
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            Registrar cuenta
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Crea una cuenta Coopera asignándole un rol disponible.
          </p>
        </header>

        {createdUser && (
          <Alert variant="success">
            Cuenta creada para {createdUser.fullName} ({createdUser.role}).
          </Alert>
        )}

        {!rolesLoading && rolesStatus.status === "error" && (
          <Alert variant="error">
            <div className="grid justify-items-start gap-3">
              <span>{rolesStatus.message}</span>
              <Button
                onClick={() => setRetryRoles((retry) => retry + 1)}
                size="sm"
                variant="outline"
              >
                Reintentar carga de roles
              </Button>
            </div>
          </Alert>
        )}

        {!rolesLoading &&
          rolesStatus.status === "success" &&
          roles.length === 0 && (
          <Alert variant="warning">
            No hay roles disponibles para crear cuentas.
          </Alert>
        )}

        <form
          className="grid gap-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            autoComplete="name"
            disabled={isSubmitting}
            error={errors.fullName?.message}
            label="Nombre completo"
            maxLength={150}
            placeholder="Nombre y apellido"
            {...register("fullName")}
          />

          <Input
            autoComplete="email"
            disabled={isSubmitting}
            error={errors.email?.message}
            label="Correo electrónico"
            maxLength={150}
            placeholder="persona@ejemplo.com"
            type="email"
            {...register("email")}
          />

          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Rol
            </span>
            <select
              aria-describedby={errors.roleId ? "register-role-error" : undefined}
              aria-invalid={Boolean(errors.roleId)}
              className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 dark:text-slate-100 ${
                errors.roleId
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500"
                  : "border-slate-300 focus:border-sky-700 focus:ring-sky-700/15 dark:border-slate-700 dark:focus:border-sky-400"
              }`}
              disabled={
                isSubmitting ||
                rolesLoading ||
                rolesStatus.status !== "success" ||
                roles.length === 0
              }
              {...register("roleId")}
            >
              <option value="">
                {rolesLoading
                  ? "Cargando roles..."
                  : "Selecciona un rol"}
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                  {role.description ? ` — ${role.description}` : ""}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p
                className="text-xs text-rose-700 dark:text-rose-300"
                id="register-role-error"
              >
                {errors.roleId.message}
              </p>
            )}
          </label>

          <Input
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.password?.message}
            hint="Entre 8 y 72 caracteres."
            label="Contraseña"
            maxLength={72}
            type="password"
            {...register("password")}
          />

          <Input
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.confirmPassword?.message}
            label="Confirmar contraseña"
            maxLength={72}
            type="password"
            {...register("confirmPassword")}
          />

          <Input
            disabled={isSubmitting}
            error={errors.organizationId?.message}
            hint="Opcional. Debe ser el ID de una organización existente."
            label="ID de organización (opcional)"
            min="1"
            step="1"
            type="number"
            {...register("organizationId")}
          />

          <Button
            className="mt-2"
            disabled={
              isSubmitting ||
              rolesLoading ||
              rolesStatus.status !== "success" ||
              roles.length === 0
            }
            fullWidth
            size="lg"
            type="submit"
          >
            {isSubmitting ? "Registrando cuenta..." : "Registrar cuenta"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          <Link
            className="font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
            to="/cuenta"
          >
            Volver al panel
          </Link>
        </p>
      </section>
    </div>
  );
};
