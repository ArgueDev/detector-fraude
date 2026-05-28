import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { suspiciousPatternsData } from "../../mock/dashboardData";

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #27272a",
  borderRadius: "12px",
  color: "#fff",
};

export default function SuspiciousPatternsChart() {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Patrones Sospechosos</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Índice de detección por tipo de anomalía
        </p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={suspiciousPatternsData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis dataKey="patron" stroke="#71717a" fontSize={10} />
            <PolarRadiusAxis stroke="#3f3f46" fontSize={10} />
            <Radar
              name="Índice"
              dataKey="valor"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.2}
            />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
