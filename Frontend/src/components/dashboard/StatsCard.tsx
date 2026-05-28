import { Icon } from "@iconify/react";

type StatsCardProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  accent: string;
  bg: string;
};

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  accent,
  bg,
}: StatsCardProps) {
  const trendIcon =
    trend === "up"
      ? "solar:arrow-up-bold"
      : trend === "down"
        ? "solar:arrow-down-bold"
        : "solar:minus-circle-bold";

  const trendColor =
    trend === "up"
      ? "text-red-400"
      : trend === "down"
        ? "text-emerald-400"
        : "text-zinc-500";

  return (
    <article
      className={`rounded-3xl border p-6 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 ${bg}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${bg}`}
        >
          <Icon icon={icon} className={`text-2xl ${accent}`} />
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <Icon icon={trendIcon} className="text-sm" />
          {change}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</p>
    </article>
  );
}
