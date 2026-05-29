import { Icon } from "@iconify/react";

type SuggestedQuestionsProps = {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
};

export default function SuggestedQuestions({
  questions,
  onSelect,
  disabled = false,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-[#111827] px-4 py-2 text-xs text-zinc-400 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon icon="solar:chat-round-dots-bold" className="text-sm shrink-0" />
          {q}
        </button>
      ))}
    </div>
  );
}
