import { useState } from "react";
import { Icon } from "@iconify/react";
import { useResumenEjecutivo } from "../../hooks/useResumenEjecutivo";
import { descargarCsvCriticos } from "../../hooks/useSiniestros";

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  color = "red",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color?: "red" | "amber" | "emerald" | "blue";
}) {
  const colors = {
    red: "text-red-400 bg-red-500/15 border-red-500/20",
    amber: "text-amber-400 bg-amber-500/15 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/15 border-blue-500/20",
  };
  const cls = colors[color];
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#111827] p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${cls}`}>
          <Icon icon={icon} className={`text-base ${cls.split(" ")[0]}`} />
        </div>
        <p className="text-sm text-zinc-400">{label}</p>
      </div>
      <p className={`mt-3 text-3xl font-bold ${cls.split(" ")[0]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const { data: resumen, isLoading: loading, error } = useResumenEjecutivo(10);
  const [exportLoading, setExportLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  // ── Texto del reporte ejecutivo ───────────────────────────────────────────

  const generarTextoReporte = (): string => {
    if (!resumen) return "";
    const r = resumen.resumen;
    const fecha = new Date().toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    return `REPORTE EJECUTIVO — SISTEMA ARIA
Aseguradora del Sur · ${fecha}
${"=".repeat(50)}

RESUMEN OPERATIVO
• Total siniestros analizados : ${r.total_siniestros.toLocaleString()}
• Casos críticos (Rojo)       : ${r.casos_criticos_rojos}
• Casos en revisión (Amarillo): ${r.casos_revision_amarillos}
• Porcentaje en riesgo        : ${r.porcentaje_en_riesgo}%
• Score promedio general      : ${r.score_promedio_general}
• Monto total reclamado       : $${r.monto_total_reclamado.toLocaleString("es-EC")}
• Monto en casos sospechosos  : $${r.monto_en_riesgo.toLocaleString("es-EC")} (${r.porcentaje_monto_riesgo}%)
• Ramo más crítico            : ${resumen.ramo_mas_critico.ramo ?? "N/D"} (${resumen.ramo_mas_critico.casos_rojos} rojos)

TOP SINIESTROS CRÍTICOS
${"─".repeat(50)}
${resumen.top_siniestros_criticos
  .map(
    (s, i) =>
      `${i + 1}. ${s.id_siniestro} | Score: ${s.score_riesgo} | ${s.ramo} | $${s.monto_reclamado?.toLocaleString("es-EC", { maximumFractionDigits: 0 })} | ${s.sucursal}`
  )
  .join("\n")}

PROVEEDORES CON MÁS ALERTAS
${"─".repeat(50)}
${resumen.proveedores_con_mas_alertas
  .map((p, i) => `${i + 1}. ${p.id_proveedor} — ${p.casos_sospechosos} casos sospechosos`)
  .join("\n")}

${"=".repeat(50)}
NOTA: ${resumen.nota}
Generado por ARIA v1.0 — Sistema de Detección de Fraudes
`;
  };

  // ── Acciones ──────────────────────────────────────────────────────────────

  const copiarReporte = async () => {
    await navigator.clipboard.writeText(generarTextoReporte());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const descargarReporte = () => {
    setExportLoading(true);
    const blob = new Blob([generarTextoReporte()], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-aria-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExportLoading(false), 800);
  };

  const handleDescargarCSV = async () => {
    setCsvLoading(true);
    try {
      await descargarCsvCriticos();
    } finally {
      setCsvLoading(false);
    }
  };

  const r = resumen?.resumen;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Resumen ejecutivo y exportación de datos para auditoría
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copiarReporte}
            disabled={loading || !resumen}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            <Icon
              icon={copied ? "solar:check-bold" : "solar:copy-bold"}
              className="text-base"
            />
            {copied ? "Copiado" : "Copiar texto"}
          </button>
          <button
            onClick={descargarReporte}
            disabled={loading || exportLoading || !resumen}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            <Icon
              icon={exportLoading ? "svg-spinners:ring-resize" : "solar:download-bold"}
              className="text-base"
            />
            Exportar TXT
          </button>
          <button
            onClick={handleDescargarCSV}
            disabled={loading || csvLoading}
            className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/25 disabled:opacity-50"
          >
            <Icon
              icon={csvLoading ? "svg-spinners:ring-resize" : "solar:file-text-bold"}
              className="text-base"
            />
            CSV Críticos
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <Icon icon="solar:danger-bold" className="text-red-400 text-xl shrink-0" />
          <p className="text-sm text-red-300">
            {error instanceof Error ? error.message : "Error al cargar el resumen"}
          </p>
        </div>
      )}

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-800/60" />
          ))}
        </div>
      ) : r ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total siniestros"
            value={r.total_siniestros.toLocaleString()}
            sub="Dataset completo analizado"
            icon="solar:document-text-bold"
            color="blue"
          />
          <StatCard
            label="Casos críticos"
            value={r.casos_criticos_rojos}
            sub={`+ ${r.casos_revision_amarillos} en revisión`}
            icon="solar:danger-bold"
            color="red"
          />
          <StatCard
            label="Score promedio"
            value={r.score_promedio_general}
            sub="Índice global de riesgo"
            icon="solar:chart-bold"
            color="amber"
          />
          <StatCard
            label="Monto en riesgo"
            value={`$${(r.monto_en_riesgo / 1000).toFixed(0)}K`}
            sub={`${r.porcentaje_monto_riesgo}% del total reclamado`}
            icon="solar:dollar-minimalistic-bold"
            color="red"
          />
        </div>
      ) : null}

      {/* Resumen ejecutivo textual */}
      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827]">
        <div className="flex items-center gap-3 border-b border-zinc-800 bg-gradient-to-r from-blue-500/5 to-transparent px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/20">
            <Icon icon="solar:notebook-bold" className="text-xl text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Resumen Ejecutivo</h2>
            <p className="text-xs text-zinc-500">
              Generado por ARIA · {new Date().toLocaleDateString("es-EC")}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="space-y-3 p-6">
            {[80, 90, 75, 85, 70].map((w, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-zinc-800/60"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : resumen ? (
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300">
              {generarTextoReporte()}
            </pre>
          </div>
        ) : null}
      </div>

      {/* Top siniestros críticos */}
      {!loading && resumen && (
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827]">
          <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20">
              <Icon icon="solar:ranking-bold" className="text-xl text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Top Siniestros Críticos</h2>
              <p className="text-xs text-zinc-500">Casos con nivel Rojo ordenados por score</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">#</th>
                  <th className="px-4 py-3">Siniestro</th>
                  <th className="px-4 py-3">Ramo</th>
                  <th className="px-4 py-3">Sucursal</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3">Alertas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {resumen.top_siniestros_criticos.map((s, i) => (
                  <tr
                    key={s.id_siniestro}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm font-bold text-zinc-600">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-sm font-medium text-white">
                      {s.id_siniestro}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{s.ramo}</td>
                    <td className="px-4 py-3 text-zinc-400">{s.sucursal}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      ${s.monto_reclamado?.toLocaleString("es-EC", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-bold text-red-400">{s.score_riesgo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
                        {s.alertas?.length ?? 0} alerta
                        {(s.alertas?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nota ética */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0b1120]/60 p-4 flex items-start gap-3">
        <Icon
          icon="solar:shield-check-bold"
          className="mt-0.5 shrink-0 text-emerald-400 text-xl"
        />
        <p className="text-xs leading-relaxed text-zinc-400">
          <span className="font-semibold text-zinc-300">Nota ética: </span>
          {resumen?.nota ??
            "Este reporte presenta alertas para revisión humana. Ningún resultado constituye una acusación de fraude."}
        </p>
      </div>
    </div>
  );
}