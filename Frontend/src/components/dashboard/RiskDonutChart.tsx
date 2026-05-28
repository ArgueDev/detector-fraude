import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { riskDonutCenter, riskDonutData } from "../../mock/dashboardData";

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #27272a",
  borderRadius: "12px",
  color: "#fff",
};

export default function RiskDonutChart() {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Distribución de Riesgo</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Clasificación por nivel de severidad
        </p>
      </div>

      <div className="relative h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={riskDonutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={120}
              paddingAngle={4}
              stroke="none"
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value ?? 0}%`, "Porcentaje"]}
            />
            <Legend
              wrapperStyle={{ color: "#a1a1aa", fontSize: "12px", paddingTop: 16 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            {riskDonutCenter.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {riskDonutCenter.level}
          </p>
          <p className="mt-0.5 text-sm font-mono text-zinc-400">
            {riskDonutCenter.score}
          </p>
        </div>
      </div>
    </section>
  );
}
