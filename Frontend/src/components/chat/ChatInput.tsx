import type { FormEvent } from "react";
import { Icon } from "@iconify/react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSend();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-zinc-800 bg-[#0f172a]/95 p-4 backdrop-blur-sm sm:p-6"
    >
      <div className="flex items-end gap-3 rounded-2xl border border-zinc-800 bg-[#111827] p-2 pl-4 shadow-lg shadow-black/20">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pregunta a ARIA sobre siniestros, riesgos o patrones..."
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-all duration-200 hover:bg-red-600 disabled:opacity-40 disabled:hover:bg-red-500"
          aria-label="Enviar"
        >
          <Icon icon="solar:plain-bold" className="text-lg" />
        </button>
      </div>
    </form>
  );
}
