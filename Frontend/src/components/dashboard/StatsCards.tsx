import type { Estadisticas } from "../../types/estadisticas.types";
import StatsCard from "./StatsCard";

type StatsCardsProps = {
  data: Estadisticas;
};

export default function StatsCards({ data }: StatsCardsProps) {
  const casosCriticos = data.por_nivel.rojo + data.por_nivel.amarillo;

  const cards = [
    {
      id: "total-siniestros",
      title: "Total Siniestros",
      value: data.total_siniestros.toLocaleString(),
      change: `${data.porcentajes.rojo}% en riesgo alto`,
      trend: "up" as const,
      icon: "solar:document-text-bold",
      accent: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "casos-criticos",
      title: "Casos Críticos",
      value: String(casosCriticos),
      change: `${data.por_nivel.rojo} rojos`,
      trend: "up" as const,
      icon: "solar:danger-bold",
      accent: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      id: "score-promedio",
      title: "Score Promedio",
      value: data.score_promedio.toFixed(1),
      change: "Índice global",
      trend: "neutral" as const,
      icon: "solar:graph-up-bold",
      accent: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      id: "monto-riesgo",
      title: "Monto en Riesgo",
      value: `$${Math.round(data.montos.en_casos_sospechosos).toLocaleString()}`,
      change: `${data.montos.porcentaje_en_riesgo}% del total`,
      trend: "neutral" as const,
      icon: "solar:wallet-money-bold",
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((stat) => (
        <StatsCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}
