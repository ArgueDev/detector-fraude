export default function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-3xl border border-zinc-800 bg-[#111827] p-8">
      <div className="h-5 w-40 rounded-lg bg-zinc-800" />
      <div className="mt-2 h-4 w-56 rounded bg-zinc-800/80" />
      <div className="mx-auto mt-10 h-[260px] w-[260px] rounded-full border-[24px] border-zinc-800" />
    </div>
  );
}
