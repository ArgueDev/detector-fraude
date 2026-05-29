import api, { CHAT_TIMEOUT_MS } from "../lib/axios";
import { parseApiResponse } from "../lib/parseApi";
import { chatResponseSchema } from "../schemas/chat.schema";
import type { ChatRequest, ChatResponse } from "../types/chat.types";

function normalizeChatPayload(data: unknown): string {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    "respuesta" in data &&
    typeof (data as { respuesta: unknown }).respuesta === "string"
  ) {
    return (data as { respuesta: string }).respuesta;
  }

  return parseApiResponse(chatResponseSchema, data);
}

export async function preguntarIA(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await api.post<unknown>("/chat/", payload, {
    timeout: CHAT_TIMEOUT_MS,
    responseType: "text",
    transformResponse: [(raw) => raw],
  });

  let parsed: unknown = data;

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        parsed = JSON.parse(trimmed) as unknown;
      } catch {
        parsed = data;
      }
    }
  }

  return normalizeChatPayload(parsed);
}
