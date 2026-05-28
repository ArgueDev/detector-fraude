type RiskLevel = "Rojo" | "Amarillo" | "Verde";

const levelStyles: Record<RiskLevel, string> = {
  Rojo: "bg-red-500/15 text-red-400 border-red-500/20",
  Amarillo: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Verde: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

type RiskBadgeProps = {
  level: RiskLevel | string;
};

export default function RiskBadge({ level }: RiskBadgeProps) {
  const styles =
    level in levelStyles
      ? levelStyles[level as RiskLevel]
      : levelStyles.Rojo;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {level}
    </span>
  );
}
