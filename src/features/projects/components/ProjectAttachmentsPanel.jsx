import { useEffect, useRef, useState } from "react";
import { getUserFacingErrorMessage } from "../../../api/httpErrors";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import {
  deleteProjectAttachment,
  downloadProjectAttachment,
  getProjectAttachments,
  MAX_FILE_SIZE_BYTES,
  uploadProjectAttachment,
} from "../api/projectAttachments";

const formatFileSize = (sizeBytes) => {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const updateQueuedFile = (setQueue, fileId, updates) =>
  setQueue((current) =>
    current.map((item) =>
      item.id === fileId ? { ...item, ...updates } : item,
    ),
  );

export const ProjectAttachmentsPanel = ({ projectId }) => {
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [queue, setQueue] = useState([]);
  const [retryKey, setRetryKey] = useState(0);
  const [request, setRequest] = useState({ key: null, status: "loading" });
  const [actionError, setActionError] = useState("");
  const [activeActionId, setActiveActionId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const requestKey = `${projectId}:${retryKey}`;

    getProjectAttachments(projectId, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setAttachments(items);
          setRequest({ key: requestKey, status: "success" });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({
            key: requestKey,
            status: "error",
            message: getUserFacingErrorMessage(
              error,
              "No se pudieron cargar los adjuntos.",
            ),
          });
        }
      });

    return () => controller.abort();
  }, [projectId, retryKey]);

  const requestKey = `${projectId}:${retryKey}`;
  const loading = request.key !== requestKey || request.status === "loading";
  const loadError =
    request.key === requestKey && request.status === "error"
      ? request.message
      : "";

  const handleFileSelection = (event) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setActionError("");
    setQueue((current) => [
      ...current,
      ...selectedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status:
          file.size > MAX_FILE_SIZE_BYTES
            ? "invalid"
            : file.size === 0
              ? "invalid"
              : "pending",
        message:
          file.size > MAX_FILE_SIZE_BYTES
            ? "El archivo supera el límite de 20 MB."
            : file.size === 0
              ? "El archivo está vacío."
              : "",
      })),
    ]);
    event.target.value = "";
  };

  const handleUpload = async (item) => {
    if (item.status === "invalid" || activeActionId) return;
    setActiveActionId(item.id);
    setActionError("");
    updateQueuedFile(setQueue, item.id, { status: "uploading", message: "" });

    try {
      const uploaded = await uploadProjectAttachment(projectId, item.file);
      setAttachments((current) => [
        uploaded,
        ...current.filter((attachment) => attachment.id !== uploaded.id),
      ]);
      updateQueuedFile(setQueue, item.id, {
        status: "uploaded",
        message: "Subido correctamente.",
      });
    } catch (error) {
      const message = getUserFacingErrorMessage(
        error,
        "No se pudo subir el archivo.",
      );
      updateQueuedFile(setQueue, item.id, { status: "error", message });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDownload = async (attachment) => {
    setActiveActionId(attachment.id);
    setActionError("");
    try {
      const blob = await downloadProjectAttachment(
        projectId,
        attachment.id,
      );
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.fileName;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch (error) {
      setActionError(
        getUserFacingErrorMessage(error, "No se pudo descargar el archivo."),
      );
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelete = async (attachment) => {
    if (
      !window.confirm(`¿Eliminar el archivo "${attachment.fileName}"?`) ||
      activeActionId
    ) {
      return;
    }

    setActiveActionId(attachment.id);
    setActionError("");
    try {
      await deleteProjectAttachment(projectId, attachment.id);
      setAttachments((current) =>
        current.filter((item) => item.id !== attachment.id),
      );
    } catch (error) {
      setActionError(
        getUserFacingErrorMessage(error, "No se pudo eliminar el archivo."),
      );
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <section aria-labelledby="project-attachments-title" className="grid gap-5">
      <header className="grid gap-1">
        <h2
          className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100"
          id="project-attachments-title"
        >
          Archivos adjuntos
        </h2>
        <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
          Los archivos se cargan al servidor solo cuando seleccionas “Subir”.
          El tamaño máximo por archivo es 20 MB.
        </p>
      </header>

      <div className="grid gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
        <input
          aria-label="Archivos para adjuntar al proyecto"
          accept="*/*"
          className="sr-only"
          multiple
          onChange={handleFileSelection}
          ref={fileInputRef}
          type="file"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="m-0 text-sm font-semibold text-slate-800 dark:text-slate-100">
              Agrega archivos al proyecto
            </p>
            <p className="mb-0 mt-1 text-xs text-slate-600 dark:text-slate-400">
              Puedes seleccionar varios archivos; ninguno se transmite hasta
              que pulses Subir.
            </p>
          </div>
          <Button
            disabled={Boolean(activeActionId)}
            onClick={() => fileInputRef.current?.click()}
            type="button"
            variant="outline"
          >
            Seleccionar archivos
          </Button>
        </div>
      </div>

      {actionError && (
        <Alert title="No se pudo completar la operación" variant="error">
          {actionError}
        </Alert>
      )}

      {queue.length > 0 && (
        <div className="grid gap-3">
          <h3 className="m-0 text-sm font-bold text-slate-800 dark:text-slate-100">
            Archivos seleccionados
          </h3>
          <ul className="m-0 grid list-none gap-2 p-0">
            {queue.map((item) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                key={item.id}
              >
                <div className="min-w-0">
                  <p className="m-0 break-all text-sm font-medium text-slate-800 dark:text-slate-100">
                    {item.file.name}
                  </p>
                  <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(item.file.size)}
                    {item.message ? ` · ${item.message}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {item.status === "pending" || item.status === "error" ? (
                    <Button
                      disabled={Boolean(activeActionId)}
                      onClick={() => handleUpload(item)}
                      size="sm"
                      type="button"
                    >
                      Subir
                    </Button>
                  ) : item.status === "uploading" ? (
                    <span
                      aria-live="polite"
                      className="self-center text-xs text-slate-600 dark:text-slate-300"
                      role="status"
                    >
                      Subiendo...
                    </span>
                  ) : null}
                  {item.status !== "uploading" && (
                    <Button
                      disabled={Boolean(activeActionId)}
                      onClick={() =>
                        setQueue((current) =>
                          current.filter((queued) => queued.id !== item.id),
                        )
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="m-0 text-sm font-bold text-slate-800 dark:text-slate-100">
            Adjuntos del proyecto
          </h3>
          {!loading && !loadError && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {attachments.length} {attachments.length === 1 ? "archivo" : "archivos"}
            </span>
          )}
        </div>

        {loadError ? (
          <Alert title="No se pudieron cargar los adjuntos" variant="error">
            <div className="grid justify-items-start gap-3">
              <span>{loadError}</span>
              <Button
                onClick={() => setRetryKey((current) => current + 1)}
                size="sm"
                variant="outline"
              >
                Reintentar
              </Button>
            </div>
          </Alert>
        ) : loading ? (
          <div
            aria-live="polite"
            className="rounded-lg border border-slate-200 p-5 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
            role="status"
          >
            Cargando adjuntos...
          </div>
        ) : attachments.length === 0 ? (
          <div className="rounded-lg border border-slate-200 p-5 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Este proyecto aún no tiene archivos adjuntos.
          </div>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0">
            {attachments.map((attachment) => (
              <li
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                key={attachment.id}
              >
                <div className="min-w-0">
                  <p className="m-0 break-all text-sm font-medium text-slate-800 dark:text-slate-100">
                    {attachment.fileName}
                  </p>
                  <p className="mb-0 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {attachment.mimeType || "Tipo desconocido"} ·{" "}
                    {attachment.sizeBytes == null
                      ? "Tamaño desconocido"
                      : formatFileSize(Number(attachment.sizeBytes))}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    disabled={Boolean(activeActionId)}
                    onClick={() => handleDownload(attachment)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {activeActionId === attachment.id
                      ? "Procesando..."
                      : "Descargar"}
                  </Button>
                  <Button
                    disabled={Boolean(activeActionId)}
                    onClick={() => handleDelete(attachment)}
                    size="sm"
                    type="button"
                    variant="danger"
                  >
                    Eliminar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ProjectAttachmentsPanel;
