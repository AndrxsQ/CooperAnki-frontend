import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "../components/ui/Alert";
import { ToastContext } from "./ToastContextValue";

const TOAST_DURATION = 6000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map());
  const activeMessages = useRef(new Set());
  const messagesById = useRef(new Map());

  const dismissToast = useCallback((id) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    const message = messagesById.current.get(id);
    messagesById.current.delete(id);
    activeMessages.current.delete(message);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, variant = "error" }) => {
      if (typeof message !== "string" || !message.trim()) return;
      if (activeMessages.current.has(message)) return;

      const id = nextId.current + 1;
      nextId.current = id;
      activeMessages.current.add(message);
      messagesById.current.set(id, message);
      setToasts((current) => [...current, { id, message, variant }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismissToast(id), TOAST_DURATION),
      );
    },
    [dismissToast],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    const handleHttpError = (event) => addToast(event.detail);
    window.addEventListener("http:error", handleHttpError);

    return () => {
      window.removeEventListener("http:error", handleHttpError);
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        aria-label="Notificaciones"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[min(24rem,calc(100vw-2rem))]"
        role="region"
      >
        {toasts.map((toast) => (
          <div className="pointer-events-auto w-full" key={toast.id}>
            <Alert
              className="shadow-lg"
              onDismiss={() => dismissToast(toast.id)}
              variant={toast.variant}
            >
              {toast.message}
            </Alert>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
