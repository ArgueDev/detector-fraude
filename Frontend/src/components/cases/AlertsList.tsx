import { Icon } from "@iconify/react";
import type { CaseAlert } from "../../mock/casesData";
import RiskBadge from "../dashboard/RiskBadge";

type AlertsListProps = {
  alerts: CaseAlert[];
};

const borderByLevel: Record<string, string> = {
  Rojo: "border-red-500/30 bg-red-500/5",
  Amarillo: "border-yellow-500/30 bg-yellow-500/5",
  Verde: "border-emerald-500/30 bg-emerald-500/5",
};

export default function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-500">
        Sin alertas activas para este caso
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {alerts.map((alert) => (
        <li
          key={alert.id}
          className={`flex gap-3 rounded-2xl border p-4 transition-all duration-200 hover:shadow-md hover:shadow-black/10 ${borderByLevel[alert.nivel] ?? borderByLevel.Rojo}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900/80">
            <Icon icon={alert.icono} className="text-xl text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-white">{alert.titulo}</p>
              <RiskBadge level={alert.nivel} />
            </div>
            <p className="mt-1 text-xs text-zinc-400">{alert.descripcion}</p>
            <p className="mt-2 font-mono text-[10px] text-zinc-600">{alert.id}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
