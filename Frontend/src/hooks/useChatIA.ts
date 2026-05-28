import { useMutation } from "@tanstack/react-query";
import { preguntarIA } from "../api/chatApi";
import type { ChatRequest } from "../types/chat.types";

export function useChatIA() {
  return useMutation({
    mutationFn: (payload: ChatRequest) => preguntarIA(payload),
    retry: false,
  });
}
