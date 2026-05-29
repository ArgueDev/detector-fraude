import { Icon } from "@iconify/react";

type QueryErrorProps = {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export default function QueryError({
  message = "No se pudieron cargar los datos",
  onRetry,
  compact = false,
}: QueryErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 text-center ${
        compact ? "mb-4 px-4 py-6" : "px-6 py-12"
      }`}
    >
      <Icon
        icon="solar:danger-circle-bold"
        className={compact ? "text-2xl text-red-400" : "text-4xl text-red-400"}
      />
      <p className={`text-sm font-medium text-white ${compact ? "mt-2" : "mt-4"}`}>
        {message}
      </p>
      {!compact && (
        <p className="mt-1 text-xs text-zinc-500">
          Verifica que el backend esté activo en localhost:8000
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20 ${
            compact ? "mt-3" : "mt-6"
          }`}
        >
          <Icon icon="solar:refresh-bold" />
          Reintentar
        </button>
      )}
    </div>
  );
}
