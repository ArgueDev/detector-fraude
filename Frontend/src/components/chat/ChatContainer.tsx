import { useState } from "react";
import {
  mockChatMessages,
  mockAssistantReply,
  suggestedQuestions,
  type ChatMessage as ChatMessageType,
} from "../../mock/chatData";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessageType[]>(mockChatMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const reply: ChatMessageType = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: mockAssistantReply,
        timestamp: new Date().toLocaleTimeString("es-EC", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, reply]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[520px] flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827] shadow-sm">
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
            IA
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">FRAUDIA Assistant</h2>
            <p className="text-xs text-emerald-400">En línea · Modo análisis</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              IA
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-[#0b1120] px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 px-4 py-3 sm:px-6">
        <SuggestedQuestions
          questions={suggestedQuestions}
          onSelect={(q) => sendMessage(q)}
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
