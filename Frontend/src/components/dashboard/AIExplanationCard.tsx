import { Icon } from "@iconify/react";
import type { Siniestro } from "../../types/siniestro.types";
import RiskBadge from "./RiskBadge";

type AIExplanationCardProps = {
  siniestro: Siniestro;
};

export default function AIExplanationCard({ siniestro }: AIExplanationCardProps) {
  const bullets = [
    ...siniestro.alertas_activadas.slice(0, 3),
    `Estado del caso: ${siniestro.estado}`,
    `Documentación ${siniestro.documentos_completos ? "completa" : "incompleta"}`,
    `Tipo de fraude simulado: ${siniestro.tipo_fraude_simulado}`,
  ].filter(Boolean);

  const reasoning = `El score de ${siniestro.score_riesgo} para ${siniestro.id_siniestro} considera cobertura ${siniestro.cobertura}, sucursal ${siniestro.sucursal}, monto reclamado de $${siniestro.monto_reclamado.toLocaleString()} y ${siniestro.alertas_activadas.length} alerta(s) activa(s). ARIA recomienda revisión prioritaria antes de autorizar pagos.`;

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827] shadow-sm">
      <div className="flex items-center gap-3 border-b border-zinc-800 bg-gradient-to-r from-red-500/5 to-transparent px-6 py-5 sm:px-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20">
          <Icon icon="solar:cpu-bolt-bold" className="text-xl text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-white">
            Análisis IA — {siniestro.id_siniestro}
          </h2>
          <p className="text-xs text-zinc-500">Análisis generado por ARIA AI</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl font-bold text-red-400">
            {siniestro.score_riesgo}
          </span>
          <RiskBadge level={siniestro.nivel_riesgo} />
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <p className="text-sm leading-relaxed text-zinc-300">
          {siniestro.descripcion}
        </p>

        <ul className="space-y-2">
          {bullets.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-zinc-400"
            >
              <Icon
                icon="solar:check-circle-bold"
                className="mt-0.5 shrink-0 text-red-400/80"
              />
              {item}
            </li>
          ))}
        </ul>

        {siniestro.alertas_activadas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {siniestro.alertas_activadas.map((alt) => (
              <span
                key={alt}
                className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"
              >
                {alt}
              </span>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-[#0b1120]/60 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <Icon icon="solar:lightbulb-bolt-bold" className="text-yellow-400" />
            Reasoning
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">{reasoning}</p>
        </div>
      </div>
    </section>
  );
}
