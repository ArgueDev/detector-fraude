import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useSearchParams } from "react-router-dom";
import { BRAND_ASSISTANT, BRAND_NAME } from "../../lib/branding";
import { useChatIA } from "../../hooks/useChatIA";
import { suggestedQuestions } from "../../mock/chatData";
import type { ChatRequest, ChatUiMessage } from "../../types/chat.types";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";
import QueryError from "../ui/QueryError";

function formatTime() {
  return new Date().toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildChatRequest(pregunta: string, idSiniestro?: string): ChatRequest {
  const summary = idSiniestro ? `Caso ${idSiniestro}` : "Consulta global";
  const preguntaFinal =
    idSiniestro && !pregunta.toUpperCase().includes(idSiniestro.toUpperCase())
      ? `${pregunta} (caso ${idSiniestro})`
      : pregunta;

  return {
    summary,
    value: { pregunta: preguntaFinal },
  };
}

export default function ChatContainer() {
  const [searchParams] = useSearchParams();
  const idSiniestro = searchParams.get("caso") ?? undefined;

  const [messages, setMessages] = useState<ChatUiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola, soy **ARIA**, tu agente de revisión inteligente antifraude. Puedo analizar casos, patrones y proveedores. ¿En qué te ayudo?",
      timestamp: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastRequestRef = useRef<ChatRequest | null>(null);
  const chatMutation = useChatIA();

  const loading = chatMutation.isPending;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const submitRequest = (request: ChatRequest) => {
    lastRequestRef.current = request;
    setErrorMsg(null);

    chatMutation.mutate(request, {
      onSuccess: (respuesta) => {
        const text =
          typeof respuesta === "string" ? respuesta.trim() : String(respuesta);

        const reply: ChatUiMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: text || "ARIA no generó una respuesta. Intenta de nuevo.",
          timestamp: formatTime(),
        };
        setMessages((prev) => [...prev, reply]);
      },
      onError: (error) => {
        setErrorMsg(error.message);
      },
    });
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatUiMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    submitRequest(buildChatRequest(trimmed, idSiniestro));
  };

  const handleRetry = () => {
    if (!lastRequestRef.current || loading) return;
    setErrorMsg(null);
    submitRequest(lastRequestRef.current);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[520px] flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827] shadow-sm">
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
            AR
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{BRAND_ASSISTANT}</h2>
            <p className="text-xs text-emerald-400">
              {BRAND_NAME} en línea
              {idSiniestro ? ` · Caso ${idSiniestro}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              AR
            </div>
            <div className="flex max-w-md items-start gap-3 rounded-2xl border border-zinc-800 bg-[#0b1120] px-4 py-3">
              <Icon
                icon="solar:cpu-bolt-bold"
                className="mt-0.5 shrink-0 animate-pulse text-lg text-red-400"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-red-400/80 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-red-400/80 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-red-400/80 [animation-delay:300ms]" />
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  ARIA está analizando tu consulta…
                </p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  El análisis con IA puede tardar hasta 2 minutos
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <QueryError message={errorMsg} onRetry={handleRetry} />
        )}
      </div>

      <div className="border-t border-zinc-800 px-4 py-3 sm:px-6">
        <SuggestedQuestions
          questions={suggestedQuestions}
          onSelect={(q) => sendMessage(q)}
          disabled={loading}
        />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => sendMessage(input)}
        disabled={loading}
      />
    </div>
  );
}
