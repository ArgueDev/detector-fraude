import { useMemo, useState } from "react";
import CaseDetailDrawer from "../components/cases/CaseDetailDrawer";
import PageHeader from "../components/layout/PageHeader";
import AIExplanationCard from "../components/dashboard/AIExplanationCard";
import CriticalCasesTable from "../components/dashboard/CriticalCasesTable";
import RiskDonutChart from "../components/dashboard/RiskDonutChart";
import StatsCards from "../components/dashboard/StatsCards";
import SuspiciousPatternsChart from "../components/dashboard/SuspiciousPatternsChart";
import TopProvidersChart from "../components/dashboard/TopProvidersChart";
import QueryError from "../components/ui/QueryError";
import SkeletonCard from "../components/ui/skeletons/SkeletonCard";
import SkeletonChart from "../components/ui/skeletons/SkeletonChart";
import SkeletonTable from "../components/ui/skeletons/SkeletonTable";
import { useEstadisticas } from "../hooks/useEstadisticas";
import { useRankingSiniestros } from "../hooks/useRankingSiniestros";
import { mapSiniestroToCriticalCase } from "../lib/siniestroMappers";

export default function DashboardPage() {
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const estadisticasQuery = useEstadisticas();
  const rankingQuery = useRankingSiniestros(10);

  const heroBadges = useMemo(() => {
    const stats = estadisticasQuery.data;
    if (!stats) return undefined;

    return [
      {
        label: "Alertas activas",
        value: String(stats.por_nivel.rojo),
        icon: "solar:bell-bing-bold",
      },
      {
        label: "ARIA activa",
        value: "ON",
        icon: "solar:cpu-bolt-bold",
      },
      {
        label: "Tasa detección",
        value: `${stats.porcentajes.verde}%`,
        icon: "solar:target-bold",
      },
    ];
  }, [estadisticasQuery.data]);

  const criticalCases = useMemo(
    () => rankingQuery.data?.items.map(mapSiniestroToCriticalCase) ?? [],
    [rankingQuery.data]
  );

  const topSiniestro = rankingQuery.data?.items[0];

  const statsError =
    estadisticasQuery.isError || rankingQuery.isError;
  const statsLoading =
    estadisticasQuery.isLoading || rankingQuery.isLoading;

  const retryAll = () => {
    estadisticasQuery.refetch();
    rankingQuery.refetch();
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Centro de control de riesgo"
        description="ARIA prioriza siniestros de alto riesgo con scoring inteligente, alertas en tiempo real y análisis asistido por IA empresarial."
        badges={heroBadges}
      />

      {statsError && (
        <QueryError
          message={
            estadisticasQuery.error?.message ??
            rankingQuery.error?.message
          }
          onRetry={retryAll}
        />
      )}

      {statsLoading && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SkeletonChart />
            <SkeletonCard />
          </div>
          <SkeletonTable />
        </>
      )}

      {!statsLoading && !statsError && estadisticasQuery.data && (
        <>
          <StatsCards data={estadisticasQuery.data} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RiskDonutChart data={estadisticasQuery.data} />
            {topSiniestro ? (
              <AIExplanationCard siniestro={topSiniestro} />
            ) : (
              <div className="rounded-3xl border border-dashed border-zinc-700 bg-[#111827] p-12 text-center text-sm text-zinc-500">
                Sin casos para análisis IA
              </div>
            )}
          </div>

          {rankingQuery.isLoading ? (
            <SkeletonTable />
          ) : (
            <CriticalCasesTable
              cases={criticalCases}
              onVerDetalle={setDrawerId}
            />
          )}
        </>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopProvidersChart />
        <SuspiciousPatternsChart />
      </div>

      <CaseDetailDrawer
        idSiniestro={drawerId}
        onClose={() => setDrawerId(null)}
      />
    </div>
  );
}
