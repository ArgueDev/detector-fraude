import { Icon } from "@iconify/react";
import type { ChatUiMessage } from "../../types/chat.types";

type ChatMessageProps = {
  message: ChatUiMessage;
};

function formatContent(content: string) {
  return content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split("\n").map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-500/20">
          AR
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
          isUser
            ? "bg-red-500/15 border border-red-500/20 text-zinc-100"
            : "bg-[#111827] border border-zinc-800 text-zinc-300"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {formatContent(message.content)}
        </p>
        <p
          className={`mt-2 flex items-center gap-1 text-[10px] text-zinc-600 ${
            isUser ? "justify-end" : ""
          }`}
        >
          {!isUser && <Icon icon="solar:cpu-bolt-linear" className="text-xs" />}
          {message.timestamp}
        </p>
      </div>
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
          <Icon icon="solar:user-bold" className="text-lg text-zinc-400" />
        </div>
      )}
    </div>
  );
}
