import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";
import { getRouteMeta } from "../../lib/routeMeta";

export default function Navbar() {
  const { pathname } = useLocation();
  const meta = getRouteMeta(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-zinc-800 bg-[#0f172a] px-4 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-white sm:text-xl">
          {meta.title}
        </h2>
        <p className="truncate text-xs text-zinc-500 sm:text-sm">
          {meta.subtitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          aria-label="Notificaciones"
        >
          <Icon icon="solar:bell-bold" className="text-xl" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0f172a]" />
        </button>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg shadow-red-500/20"
          title="Asistente IA"
        >
          IA
        </div>
      </div>
    </header>
  );
}
