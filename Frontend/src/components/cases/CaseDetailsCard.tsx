import { Icon } from "@iconify/react";
import type { FraudCase } from "../../mock/casesData";
import RiskBadge from "../dashboard/RiskBadge";
import ScoreIndicator from "./ScoreIndicator";

type CaseDetailsCardProps = {
  caseData: FraudCase;
};

export default function CaseDetailsCard({ caseData }: CaseDetailsCardProps) {
  return (
    <article className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Detalle del siniestro
          </p>
          <h3 className="mt-1 text-xl font-bold text-white">{caseData.id_siniestro}</h3>
          <p className="text-sm text-zinc-500">{caseData.ramo} · {caseData.estado}</p>
        </div>
        <RiskBadge level={caseData.nivel_riesgo} />
      </div>

      <div className="mt-6">
        <ScoreIndicator score={caseData.score_riesgo} />
      </div>

      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-xs text-zinc-500">Cobertura</dt>
          <dd className="mt-0.5 text-sm font-medium text-white">{caseData.cobertura}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Sucursal</dt>
          <dd className="mt-0.5 text-sm font-medium text-white">{caseData.sucursal}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Descripción</dt>
          <dd className="mt-0.5 text-sm leading-relaxed text-zinc-400">
            {caseData.descripcion}
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-[#0b1120]/50 p-4">
          <p className="text-xs text-zinc-500">Monto reclamado</p>
          <p className="mt-1 text-lg font-semibold text-white">
            ${caseData.monto_reclamado.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-[#0b1120]/50 p-4">
          <p className="text-xs text-zinc-500">Monto pagado</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            ${caseData.monto_pagado.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2 border-t border-zinc-800 pt-5 text-xs text-zinc-500">
        <p className="flex items-center gap-2">
          <Icon icon="solar:calendar-bold" />
          Ocurrencia: {caseData.fecha_ocurrencia}
        </p>
        <p className="flex items-center gap-2">
          <Icon icon="solar:document-bold" />
          Reporte: {caseData.fecha_reporte}
        </p>
      </div>
    </article>
  );
}
