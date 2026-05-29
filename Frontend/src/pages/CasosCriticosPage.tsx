"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import RiskBadge from "../components/dashboard/RiskBadge";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";


interface Siniestro {
  id_siniestro: string;
  id_poliza: string;
  id_asegurado: string;
  ramo: string;
  cobertura: string;
  estado: string;
  sucursal: string;
  fecha_ocurrencia: string;
  fecha_reporte: string;
  monto_reclamado: number;
  monto_estimado: number;
  score_riesgo: number;
  nivel_riesgo: string;
  alertas_activadas: string | string[];
  documentos_completos: boolean;
  descripcion: string;
  historial_siniestros_asegurado: number;
  dias_desde_inicio_poliza: number;
  dias_desde_fin_poliza: number;
  dias_entre_ocurrencia_reporte: number;
  tipo_fraude_simulado: string;
}

function parseAlertas(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ siniestro, onClose }: { siniestro: Siniestro; onClose: () => void }) {
  const alertas = parseAlertas(siniestro.alertas_activadas);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto bg-[#0d1117] border-l border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-white">{siniestro.id_siniestro}</h2>
            <p className="text-xs text-zinc-500">{siniestro.ramo} · {siniestro.cobertura}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold text-red-400">{siniestro.score_riesgo}</span>
            <RiskBadge level={siniestro.nivel_riesgo} />
            <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
              <Icon icon="solar:close-bold" className="text-xl" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Descripción */}
          <div className="rounded-2xl border border-zinc-800 bg-[#111827] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Descripción</p>
            <p className="text-sm leading-relaxed text-zinc-300">{siniestro.descripcion || "Sin descripción."}</p>
          </div>

          {/* Datos clave */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Asegurado", value: siniestro.id_asegurado },
              { label: "Póliza", value: siniestro.id_poliza },
              { label: "Estado", value: siniestro.estado },
              { label: "Sucursal", value: siniestro.sucursal },
              { label: "Fecha ocurrencia", value: siniestro.fecha_ocurrencia },
              { label: "Fecha reporte", value: siniestro.fecha_reporte },
              { label: "Días inicio póliza", value: `${siniestro.dias_desde_inicio_poliza} días` },
              { label: "Días fin póliza", value: `${siniestro.dias_desde_fin_poliza} días` },
              { label: "Días ocurr→reporte", value: `${siniestro.dias_entre_ocurrencia_reporte} días` },
              { label: "Historial previo", value: `${siniestro.historial_siniestros_asegurado} siniestros` },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-zinc-800 bg-[#111827] p-3">
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="mt-0.5 text-sm font-medium text-white truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Montos */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Monto reclamado", value: siniestro.monto_reclamado, color: "text-red-400" },
              { label: "Monto estimado", value: siniestro.monto_estimado, color: "text-amber-400" },
            ].map((m) => (
              <div key={m.label} className="col-span-1 rounded-xl border border-zinc-800 bg-[#111827] p-3 text-center">
                <p className="text-xs text-zinc-500">{m.label}</p>
                <p className={`mt-1 text-base font-bold ${m.color}`}>
                  ${m.value?.toLocaleString("es-EC", { maximumFractionDigits: 0 }) ?? "—"}
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-zinc-800 bg-[#111827] p-3 text-center">
              <p className="text-xs text-zinc-500">Documentos</p>
              <p className={`mt-1 text-base font-bold ${siniestro.documentos_completos ? "text-emerald-400" : "text-red-400"}`}>
                {siniestro.documentos_completos ? "Completos" : "Incompletos"}
              </p>
            </div>
          </div>

          {/* Alertas */}
          {alertas.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Alertas activadas ({alertas.length})
              </p>
              <ul className="space-y-2">
                {alertas.map((a) => (
                  <li key={a} className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2">
                    <Icon icon="solar:danger-bold" className="mt-0.5 shrink-0 text-red-400" />
                    <span className="text-xs leading-relaxed text-zinc-300">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reasoning ARIA */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0b1120]/60 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Icon icon="solar:lightbulb-bolt-bold" className="text-yellow-400" />
              Razonamiento ARIA
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              El score de {siniestro.score_riesgo} para {siniestro.id_siniestro} considera cobertura{" "}
              {siniestro.cobertura}, sucursal {siniestro.sucursal}, monto reclamado de $
              {siniestro.monto_reclamado?.toLocaleString()} y {alertas.length} alerta(s) activa(s).
              ARIA recomienda revisión prioritaria antes de autorizar pagos.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const NIVELES = ["Todos", "Rojo", "Amarillo", "Verde"];

export default function CasosCriticosPage() {
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [selected, setSelected] = useState<Siniestro | null>(null);
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [filtroRamo, setFiltroRamo] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchSiniestros = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) });
      if (filtroNivel !== "Todos") params.set("nivel_riesgo", filtroNivel);
      if (filtroRamo) params.set("ramo", filtroRamo);
      const res = await fetch(`${API}/siniestros/?${params}`);
      const data = await res.json();
      setSiniestros(data.items ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [filtroNivel, filtroRamo, offset]);

  useEffect(() => { fetchSiniestros(); }, [fetchSiniestros]);

  const recalcularTodos = async () => {
    setRecalcLoading(true);
    try {
      await fetch(`${API}/siniestros/recalcular-todos`, { method: "POST" });
      await fetchSiniestros();
    } finally {
      setRecalcLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Casos Críticos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {total.toLocaleString()} siniestros · filtrados y ordenados por score de riesgo
          </p>
        </div>
        <button
          onClick={recalcularTodos}
          disabled={recalcLoading}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          <Icon icon={recalcLoading ? "svg-spinners:ring-resize" : "solar:refresh-bold"} className="text-base" />
          {recalcLoading ? "Recalculando..." : "Recalcular todos"}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Nivel */}
        <div className="flex rounded-xl border border-zinc-800 bg-[#111827] p-1 gap-1">
          {NIVELES.map((n) => (
            <button
              key={n}
              onClick={() => { setFiltroNivel(n); setOffset(0); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filtroNivel === n
                  ? "bg-red-500/20 text-red-400 border border-red-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Ramo */}
        <input
          type="text"
          placeholder="Filtrar por ramo..."
          value={filtroRamo}
          onChange={(e) => { setFiltroRamo(e.target.value); setOffset(0); }}
          className="rounded-xl border border-zinc-800 bg-[#111827] px-4 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
        />

        {(filtroNivel !== "Todos" || filtroRamo) && (
          <button
            onClick={() => { setFiltroNivel("Todos"); setFiltroRamo(""); setOffset(0); }}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <Icon icon="solar:close-circle-bold" />
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4">Siniestro</th>
                <th className="px-4 py-4">Ramo</th>
                <th className="px-4 py-4">Cobertura</th>
                <th className="px-4 py-4">Sucursal</th>
                <th className="px-4 py-4 text-right">Monto</th>
                <th className="px-4 py-4 text-center">Score</th>
                <th className="px-4 py-4">Nivel</th>
                <th className="px-4 py-4">Alertas</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 animate-pulse rounded bg-zinc-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                siniestros.map((s) => {
                  const alertas = parseAlertas(s.alertas_activadas);
                  return (
                    <tr
                      key={s.id_siniestro}
                      className="group cursor-pointer hover:bg-zinc-800/40 transition-colors"
                      onClick={() => setSelected(s)}
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium text-white">
                        {s.id_siniestro}
                      </td>
                      <td className="px-4 py-4 text-zinc-300">{s.ramo}</td>
                      <td className="px-4 py-4 text-zinc-400">{s.cobertura}</td>
                      <td className="px-4 py-4 text-zinc-400">{s.sucursal}</td>
                      <td className="px-4 py-4 text-right font-medium text-white">
                        ${s.monto_reclamado?.toLocaleString("es-EC", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-mono font-bold ${
                          s.score_riesgo >= 76 ? "text-red-400" :
                          s.score_riesgo >= 41 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {s.score_riesgo}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <RiskBadge level={s.nivel_riesgo} />
                      </td>
                      <td className="px-4 py-4">
                        {alertas.length > 0 ? (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
                            {alertas.length} alerta{alertas.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Icon
                          icon="solar:arrow-right-bold"
                          className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
          <p className="text-xs text-zinc-500">
            Página {currentPage} de {totalPages} · {total} resultados
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-40"
            >
              <Icon icon="solar:arrow-left-bold" />
              Anterior
            </button>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-40"
            >
              Siguiente
              <Icon icon="solar:arrow-right-bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selected && <DetailDrawer siniestro={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}