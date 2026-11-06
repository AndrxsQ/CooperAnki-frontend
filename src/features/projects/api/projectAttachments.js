import api from "../../../api/axios";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const attachmentPath = (projectId, attachmentId = "") =>
  `/projects/${encodeURIComponent(projectId)}/attachments${
    attachmentId ? `/${encodeURIComponent(attachmentId)}` : ""
  }`;

const isAttachment = (attachment) =>
  attachment &&
  Number.isInteger(Number(attachment.id)) &&
  typeof attachment.fileName === "string" &&
  (attachment.mimeType == null || typeof attachment.mimeType === "string") &&
  (attachment.sizeBytes == null || Number.isFinite(Number(attachment.sizeBytes))) &&
  typeof attachment.downloadUrl === "string";

const requireAttachment = (data) => {
  if (!isAttachment(data)) {
    throw new Error("La respuesta del adjunto no tiene el formato esperado.");
  }
  return data;
};

export const getProjectAttachments = async (projectId, signal) => {
  const { data } = await api.get(attachmentPath(projectId), { signal });
  if (!Array.isArray(data) || data.some((attachment) => !isAttachment(attachment))) {
    throw new Error("La respuesta de adjuntos no tiene el formato esperado.");
  }
  return data;
};

export const uploadProjectAttachment = async (projectId, file, signal) => {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona un archivo que no esté vacío.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("El archivo supera el límite de 20 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(attachmentPath(projectId), formData, {
    signal,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return requireAttachment(data);
};

export const downloadProjectAttachment = async (
  projectId,
  attachmentId,
  signal,
) => {
  const { data } = await api.get(
    `${attachmentPath(projectId, attachmentId)}/content`,
    { responseType: "blob", signal },
  );
  return data;
};

export const deleteProjectAttachment = async (projectId, attachmentId) => {
  await api.delete(attachmentPath(projectId, attachmentId));
};

export { MAX_FILE_SIZE_BYTES };
