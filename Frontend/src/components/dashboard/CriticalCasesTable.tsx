import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import type { FraudCase } from "../../mock/casesData";
import RiskBadge from "./RiskBadge";

export type CriticalCase = Pick<
  FraudCase,
  | "id"
  | "id_siniestro"
  | "ramo"
  | "score_riesgo"
  | "nivel_riesgo"
  | "cobertura"
  | "sucursal"
  | "monto_reclamado"
>;

type CriticalCasesTableProps = {
  cases: CriticalCase[];
  showAction?: boolean;
};

export default function CriticalCasesTable({
  cases,
  showAction = true,
}: CriticalCasesTableProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827]">
      <div className="border-b border-zinc-800 px-6 py-6 sm:px-8">
        <h2 className="text-xl font-semibold text-white">
          Casos Críticos Priorizados
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Siniestros con mayor score de riesgo
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4 font-medium sm:px-8">Siniestro</th>
              <th className="px-4 py-4 font-medium">Score</th>
              <th className="px-4 py-4 font-medium">Nivel</th>
              <th className="px-4 py-4 font-medium">Cobertura</th>
              <th className="px-4 py-4 font-medium">Sucursal</th>
              <th className="px-6 py-4 font-medium text-right sm:px-8">Monto</th>
              {showAction && (
                <th className="px-6 py-4 font-medium text-right sm:px-8">Acción</th>
              )}
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr
                key={item.id}
                className="border-b border-zinc-800/80 transition-colors last:border-b-0 hover:bg-zinc-800/40"
              >
                <td className="px-6 py-5 sm:px-8">
                  <p className="font-semibold text-white">{item.id_siniestro}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{item.ramo}</p>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{ width: `${Math.min(item.score_riesgo, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm font-medium text-zinc-300">
                      {item.score_riesgo}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <RiskBadge level={item.nivel_riesgo} />
                </td>
                <td className="px-4 py-5 text-zinc-300">{item.cobertura}</td>
                <td className="px-4 py-5 text-zinc-300">{item.sucursal}</td>
                <td className="px-6 py-5 text-right font-medium text-white sm:px-8">
                  ${item.monto_reclamado.toLocaleString()}
                </td>
                {showAction && (
                  <td className="px-6 py-5 text-right sm:px-8">
                    <Link
                      to={`/casos?caso=${item.id_siniestro}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                    >
                      Ver
                      <Icon icon="solar:arrow-right-linear" className="text-sm" />
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
