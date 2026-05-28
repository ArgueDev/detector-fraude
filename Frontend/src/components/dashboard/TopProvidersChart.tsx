import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useProveedoresAlertas } from "../../hooks/useDashboardCharts";
import QueryError from "../ui/QueryError";
import SkeletonChart from "../ui/skeletons/SkeletonChart";
import { topProvidersData } from "../../mock/dashboardData";

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #27272a",
  borderRadius: "12px",
  color: "#fff",
};

export default function TopProvidersChart() {
  const query = useProveedoresAlertas(8);

  const chartData =
    query.data?.items.map((item) => ({
      proveedor: item.id_proveedor,
      alertas: item.casos_rojos + item.casos_amarillos,
    })) ??
    (query.isError ? topProvidersData : []);

  if (query.isLoading) {
    return <SkeletonChart />;
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Top Proveedores con Alertas</h2>
        <p className="mt-1 text-sm text-zinc-500">Ranking por volumen de alertas activas</p>
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
            Sin datos de proveedores
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis
                type="category"
                dataKey="proveedor"
                stroke="#71717a"
                fontSize={11}
                width={130}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="alertas" fill="#ef4444" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
