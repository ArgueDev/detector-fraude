type ScoreIndicatorProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

function scoreColor(score: number) {
  if (score >= 70) return { bar: "bg-red-500", text: "text-red-400" };
  if (score >= 45) return { bar: "bg-yellow-500", text: "text-yellow-400" };
  return { bar: "bg-emerald-500", text: "text-emerald-400" };
}

export default function ScoreIndicator({ score, size = "md" }: ScoreIndicatorProps) {
  const colors = scoreColor(score);
  const textSize =
    size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-3xl";

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <span className={`font-mono font-bold ${textSize} ${colors.text}`}>
          {score}
        </span>
        <span className="text-xs text-zinc-500">/ 100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-200 ${colors.bar}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}
