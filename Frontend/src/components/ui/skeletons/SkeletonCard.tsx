export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-zinc-800 bg-[#111827] p-6">
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-2xl bg-zinc-800" />
        <div className="h-4 w-16 rounded-lg bg-zinc-800" />
      </div>
      <div className="mt-5 h-4 w-24 rounded bg-zinc-800" />
      <div className="mt-3 h-8 w-32 rounded-lg bg-zinc-800" />
    </div>
  );
}
