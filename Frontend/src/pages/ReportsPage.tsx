import { Icon } from "@iconify/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../components/layout/PageHeader";
import QueryError from "../components/ui/QueryError";
import SkeletonCard from "../components/ui/skeletons/SkeletonCard";
import DownloadExecutiveReportButton from "../components/reports/DownloadExecutiveReportButton";
import { useReportes } from "../hooks/useReportes";
import {
  reportCards,
  reportMiniChartData,
  reportsSummary,
} from "../mock/dashboardData";

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #27272a",
  borderRadius: "12px",
  color: "#fff",
};

export default function ReportsPage() {
  const reportesQuery = useReportes();

  const resumenEjecutivo = reportesQuery.data
    ? `ARIA analizó ${reportesQuery.data.total_siniestros.toLocaleString()} siniestros con un score promedio de ${reportesQuery.data.score_promedio}. El ${reportesQuery.data.porcentajes.verde}% presenta riesgo bajo y $${Math.round(reportesQuery.data.montos.en_casos_sospechosos).toLocaleString()} permanece en casos sospechosos (${reportesQuery.data.montos.porcentaje_en_riesgo}% del total reclamado).`
    : reportsSummary.resumenEjecutivo;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Reportes"
        title="Centro de informes"
        description="Genera, exporta y consulta reportes ejecutivos generados por ARIA."
      />

      {reportesQuery.isError && (
        <QueryError
          message={reportesQuery.error.message}
          onRetry={() => reportesQuery.refetch()}
        />
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {reportesQuery.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : [
          {
            label: "Total siniestros",
            value: reportesQuery.data?.total_siniestros.toLocaleString() ?? "—",
          },
          {
            label: "Casos rojos",
            value: reportesQuery.data?.por_nivel.rojo ?? "—",
          },
          {
            label: "Monto en riesgo",
            value: reportesQuery.data
              ? `$${Math.round(reportesQuery.data.montos.en_casos_sospechosos).toLocaleString()}`
              : "—",
          },
          {
            label: "Tasa detección",
            value: reportesQuery.data
              ? `${reportesQuery.data.porcentajes.verde}%`
              : "—",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-3xl border border-zinc-800 bg-[#111827] p-5 text-center"
          >
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="mt-1 text-xs text-zinc-500">{m.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20">
            <Icon icon="solar:cpu-bolt-bold" className="text-xl text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Resumen ejecutivo ARIA</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {resumenEjecutivo}
            </p>
          </div>
        </div>

        <div className="mt-8 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={reportMiniChartData}>
              <defs>
                <linearGradient id="colorDetectados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mes" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="detectados"
                stroke="#ef4444"
                fill="url(#colorDetectados)"
              />
              <Area
                type="monotone"
                dataKey="resueltos"
                stroke="#22c55e"
                fill="transparent"
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reportCards.map((report) => (
          <article
            key={report.id}
            className="group rounded-3xl border border-zinc-800 bg-[#111827] p-6 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                <Icon icon={report.icon} className="text-2xl text-red-400" />
              </div>
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-500">
                {report.tipo}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">{report.titulo}</h3>
            <p className="mt-2 text-sm text-zinc-500">{report.descripcion}</p>
            <p className="mt-3 text-xs text-zinc-600">{report.fecha}</p>

            <div className="mt-5 flex gap-4 border-t border-zinc-800 pt-5 text-xs">
              <span className="text-zinc-500">
                Casos: <strong className="text-white">{report.metricas.casos}</strong>
              </span>
              <span className="text-zinc-500">
                Monto: <strong className="text-white">{report.metricas.monto}</strong>
              </span>
              <span className="text-zinc-500">
                Score: <strong className="text-white">{report.metricas.score}</strong>
              </span>
            </div>

            <div className="mt-5">
              <DownloadExecutiveReportButton
                reportType={report.reportType}
                report={report}
                resumen={reportesQuery.data}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
