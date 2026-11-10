import { useCallback, useEffect, useRef, useState } from "react";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { useToast } from "../../../context/useToast";
import { getProjectRecommendations } from "../api/matching";

const pollingIntervalMs = 60_000;
const pageSize = 100;

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

const isStoredNotification = (notification) =>
  notification &&
  Number.isInteger(Number(notification.id)) &&
  typeof notification.title === "string" &&
  typeof notification.sourceUrl === "string" &&
  typeof notification.discoveredAt === "string" &&
  typeof notification.isRead === "boolean" &&
  (notification.compatibilityScore == null ||
    Number.isFinite(Number(notification.compatibilityScore)));

const getSafeSourceUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

const readStoredState = (storageKey) => {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;

  const state = JSON.parse(stored);
  if (
    !state ||
    state.initialized !== true ||
    !Array.isArray(state.seenIds) ||
    !state.seenIds.every((id) => Number.isInteger(Number(id))) ||
    !Array.isArray(state.notifications) ||
    !state.notifications.every(isStoredNotification)
  ) {
    throw new Error("El historial local de notificaciones no es válido.");
  }

  return state;
};

const NotificationsList = ({ notifications, onMarkRead }) => (
  <ul className="m-0 grid list-none gap-3 p-0">
    {notifications.map((notification) => (
      <li
        className={`rounded-lg border p-4 ${
          notification.isRead
            ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
            : "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30"
        }`}
        key={notification.id}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
              Nueva convocatoria compatible
            </p>
            <h3 className="mb-0 mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {notification.title}
            </h3>
            <p className="mb-0 mt-1 text-xs text-slate-600 dark:text-slate-400">
              Detectada {formatDateTime(notification.discoveredAt)}
            </p>
          </div>
          {!notification.isRead && (
            <span className="rounded-full bg-sky-700 px-2 py-1 text-xs font-semibold text-white dark:bg-sky-600">
              Nueva
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          {getSafeSourceUrl(notification.sourceUrl) ? (
            <a
              className="text-sm font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-950 dark:text-sky-300 dark:hover:text-sky-200"
              href={getSafeSourceUrl(notification.sourceUrl)}
              rel="noopener noreferrer"
              target="_blank"
              onClick={() => onMarkRead(notification.id)}
            >
              Ver convocatoria
            </a>
          ) : (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Enlace oficial no disponible
            </span>
          )}
          {!notification.isRead && (
            <button
              className="text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              type="button"
              onClick={() => onMarkRead(notification.id)}
            >
              Marcar como leída
            </button>
          )}
        </div>
      </li>
    ))}
  </ul>
);

export const MatchingNotificationsPanel = ({ projectId, projectTitle }) => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [storageMessage, setStorageMessage] = useState("");
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const requestInProgress = useRef(false);
  const storageKey = `cooperanki:matching-notifications:${projectId}`;
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;
  const visibleNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  const persistNotifications = useCallback(
    (state) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        setStorageMessage("");
      } catch {
        setStorageMessage(
          "No fue posible guardar las notificaciones en este navegador; podrían no conservarse al cerrar la sesión.",
        );
      }
    },
    [storageKey],
  );

  const checkForNotifications = useCallback(
    async (signal, isInitialCheck) => {
      if (requestInProgress.current) return;
      requestInProgress.current = true;
      if (isInitialCheck) setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await getProjectRecommendations(projectId, {
          page: 0,
          size: pageSize,
          signal,
        });
        if (signal.aborted) return;

        const compatibleMatches = result.content.filter(
          (match) => match.status === "SUGGESTED",
        );
        let storedState;

        try {
          storedState = readStoredState(storageKey);
        } catch {
          setStorageMessage(
            "El historial local de alertas no se pudo leer. Se establecerá una nueva línea base con las recomendaciones actuales.",
          );
          storedState = null;
        }

        if (!storedState) {
          storedState = {
            initialized: true,
            seenIds: compatibleMatches.map((match) => match.fundingOpportunityId),
            notifications: [],
          };
          persistNotifications(storedState);
          setNotifications([]);
          setInitialized(true);
          setLastCheckedAt(new Date().toISOString());
          return;
        }

        const knownIds = new Set(storedState.seenIds.map(String));
        const newlyDiscovered = compatibleMatches.filter(
          (match) => !knownIds.has(String(match.fundingOpportunityId)),
        );
        const discoveredAt = new Date().toISOString();
        const newNotifications = newlyDiscovered.map((match) => ({
          id: match.fundingOpportunityId,
          title: match.title,
          sourceUrl: match.sourceUrl,
          compatibilityScore: match.compatibilityScore,
          discoveredAt,
          isRead: false,
        }));
        const nextState = {
          initialized: true,
          seenIds: [
            ...new Set([
              ...storedState.seenIds.map(Number),
              ...compatibleMatches.map((match) =>
                Number(match.fundingOpportunityId),
              ),
            ]),
          ],
          notifications: [
            ...newNotifications,
            ...storedState.notifications,
          ],
        };

        persistNotifications(nextState);
        setNotifications(nextState.notifications);
        setInitialized(true);
        setLastCheckedAt(discoveredAt);

        if (newNotifications.length > 0) {
          addToast({
            message: `${newNotifications.length} nueva${
              newNotifications.length === 1 ? "" : "s"
            } convocatoria${newNotifications.length === 1 ? "" : "s"} compatible${
              newNotifications.length === 1 ? "" : "s"
            } para «${projectTitle}».`,
            variant: "success",
          });
        }
      } catch (error) {
        if (!signal.aborted) {
          setErrorMessage(
            getUserFacingErrorMessage(
              error,
              "No se pudieron revisar las nuevas convocatorias compatibles.",
            ),
          );
        }
      } finally {
        requestInProgress.current = false;
        if (!signal.aborted) setIsLoading(false);
      }
    },
    [addToast, persistNotifications, projectId, projectTitle, storageKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    requestInProgress.current = false;

    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        checkForNotifications(controller.signal, true);
      }
    });

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        checkForNotifications(controller.signal, false);
      }
    }, pollingIntervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkForNotifications(controller.signal, false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [checkForNotifications, retryKey]);

  const updateNotifications = (update) => {
    const next = update(notifications);
    setNotifications(next);
    try {
      const storedState = readStoredState(storageKey);
      if (!storedState) {
        throw new Error("No existe un historial local inicializado.");
      }
      persistNotifications({
        ...storedState,
        notifications: next,
      });
    } catch {
      setStorageMessage(
        "No fue posible actualizar el historial de notificaciones guardado.",
      );
    }
  };

  const markNotificationRead = (notificationId) => {
    updateNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const markAllRead = () => {
    updateNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  return (
    <section
      aria-labelledby="matching-notifications-title"
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="m-0 text-base font-semibold text-slate-900 dark:text-slate-100"
              id="matching-notifications-title"
            >
              Alertas de convocatorias compatibles
            </h2>
            <span
              aria-label={`${unreadCount} notificaciones sin leer`}
              className="inline-flex min-w-6 items-center justify-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-900 dark:bg-sky-900 dark:text-sky-100"
            >
              {unreadCount}
            </span>
          </div>
          <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
            Revisión automática cada minuto para este proyecto.
            {lastCheckedAt && (
              <> Última revisión: {formatDateTime(lastCheckedAt)}.</>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onClick={markAllRead}
            >
              Marcar todo como leído
            </button>
          )}
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            disabled={isLoading}
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            {isLoading ? "Revisando..." : "Revisar ahora"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
          role="alert"
        >
          <p className="m-0">{errorMessage}</p>
          <button
            className="mt-2 font-semibold underline underline-offset-2"
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {storageMessage && (
        <p
          className="m-0 text-xs text-amber-800 dark:text-amber-200"
          role="status"
        >
          {storageMessage}
        </p>
      )}

      {!initialized && isLoading && (
        <p
          aria-live="polite"
          className="m-0 text-sm text-slate-600 dark:text-slate-300"
        >
          Cargando alertas...
        </p>
      )}

      {initialized && notifications.length === 0 && !errorMessage && (
        <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
          No hay alertas nuevas. Te avisaremos cuando aparezcan recomendaciones
          compatibles para este proyecto.
        </p>
      )}

      {visibleNotifications.length > 0 && (
        <NotificationsList
          notifications={visibleNotifications}
          onMarkRead={markNotificationRead}
        />
      )}

      {notifications.length > 5 && (
        <button
          aria-expanded={showAll}
          className="w-fit text-sm font-semibold text-sky-800 underline underline-offset-2 dark:text-sky-300"
          type="button"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll
            ? "Mostrar menos alertas"
            : `Ver todas las alertas (${notifications.length})`}
        </button>
      )}
    </section>
  );
};
