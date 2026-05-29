export default function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827]">
      <div className="border-b border-zinc-800 px-8 py-6">
        <div className="h-6 w-48 rounded-lg bg-zinc-800" />
        <div className="mt-2 h-4 w-64 rounded bg-zinc-800/80" />
      </div>
      <div className="space-y-0 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-zinc-800/50 px-6 py-5 last:border-0"
          >
            <div className="h-10 w-28 rounded-lg bg-zinc-800" />
            <div className="h-2 w-20 flex-1 rounded-full bg-zinc-800" />
            <div className="h-6 w-16 rounded-full bg-zinc-800" />
            <div className="h-4 w-20 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
