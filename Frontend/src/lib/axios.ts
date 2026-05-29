import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const API_TIMEOUT_MS = 60_000;
export const CHAT_TIMEOUT_MS = 120_000;

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

function isChatRequest(config?: InternalAxiosRequestConfig): boolean {
  const url = config?.url ?? "";
  return url.includes("/chat/") || url.endsWith("/chat");
}

function isTimeoutError(error: AxiosError): boolean {
  return (
    error.code === "ECONNABORTED" ||
    error.message.toLowerCase().includes("timeout")
  );
}

function formatApiError(
  error: AxiosError<{ detail?: string | { msg: string }[]; message?: string }>
): string {
  if (isTimeoutError(error)) {
    return isChatRequest(error.config)
      ? "ARIA tardó demasiado en responder. Intenta nuevamente."
      : "La solicitud tardó demasiado. Intenta nuevamente.";
  }

  const detail = error.response?.data?.detail;
  let message: string | undefined;

  if (Array.isArray(detail)) {
    message = detail.map((item) => item.msg).join(". ");
  } else if (typeof detail === "string") {
    message = detail;
  }

  return (
    message ??
    error.response?.data?.message ??
    "Error de conexión con el servidor"
  );
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | { msg: string }[]; message?: string }>) => {
    return Promise.reject(new Error(formatApiError(error)));
  }
);

export default api;
