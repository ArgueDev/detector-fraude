export default function SkeletonChat() {
  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[520px] animate-pulse flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827]">
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-zinc-800" />
            <div className="h-3 w-24 rounded bg-zinc-800/80" />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-6 p-6">
        <div className="ml-auto h-16 w-2/3 rounded-2xl bg-zinc-800" />
        <div className="h-24 w-3/4 rounded-2xl bg-zinc-800/80" />
        <div className="ml-auto h-12 w-1/2 rounded-2xl bg-zinc-800" />
      </div>
    </div>
  );
}
