import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { usePatronesRepetidos } from "../../hooks/useDashboardCharts";
import QueryError from "../ui/QueryError";
import SkeletonChart from "../ui/skeletons/SkeletonChart";
import { suspiciousPatternsData } from "../../mock/dashboardData";

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #27272a",
  borderRadius: "12px",
  color: "#fff",
};

export default function SuspiciousPatternsChart() {
  const query = usePatronesRepetidos();

  const chartData =
    query.data?.patrones.slice(0, 6).map((p) => ({
      patron: p.patron,
      valor: p.frecuencia,
    })) ??
    (query.isError ? suspiciousPatternsData : []);

  if (query.isLoading) {
    return <SkeletonChart />;
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Patrones Sospechosos</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Frecuencia de alertas en casos de riesgo
        </p>
      </div>

      {query.isError && (
        <QueryError
          compact
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      )}

      <div className="h-[280px] w-full">
        {chartData.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-zinc-500">
            Sin patrones detectados
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="patron" stroke="#71717a" fontSize={10} />
              <PolarRadiusAxis stroke="#3f3f46" fontSize={10} />
              <Radar
                name="Frecuencia"
                dataKey="valor"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.2}
              />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
