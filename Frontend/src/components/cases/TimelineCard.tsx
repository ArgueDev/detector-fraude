import { Icon } from "@iconify/react";
import type { TimelineEvent } from "../../types/timeline.types";

type TimelineCardProps = {
  events: TimelineEvent[];
};

export default function TimelineCard({ events }: TimelineCardProps) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#111827] p-6">
      <h3 className="text-sm font-semibold text-white">Línea de tiempo</h3>
      <p className="mt-1 text-xs text-zinc-500">Eventos del ciclo del siniestro</p>

      <ol className="relative mt-6 space-y-0">
        {events.map((event, index) => (
          <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < events.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${
                  event.completado ? "bg-red-500/40" : "bg-zinc-700"
                }`}
              />
            )}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                event.completado
                  ? "border-red-500/40 bg-red-500/15 text-red-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-500"
              }`}
            >
              <Icon
                icon={
                  event.completado
                    ? "solar:check-circle-bold"
                    : "solar:clock-circle-bold"
                }
                className="text-sm"
              />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-white">{event.label}</p>
              <p className="text-xs text-zinc-500">{event.fecha}</p>
              <p className="mt-1 text-xs text-zinc-400">{event.descripcion}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
