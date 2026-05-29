import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  BRAND_FOOTER,
  BRAND_NAME,
  BRAND_NAME_AI,
  BRAND_TAGLINE,
} from "../../lib/branding";

const navItems = [
  { to: "/", label: "Dashboard", icon: "solar:chart-bold", end: true },
  { to: "/analisis-riesgo", label: "Análisis de Riesgo", icon: "solar:graph-bold", end: false },
  { to: "/casos", label: "Casos Críticos", icon: "solar:shield-warning-bold", end: false },
  { to: "/casos-criticos", label: "Casos Críticos (Detalle)", icon: "solar:danger-triangle-bold", end: false },
  { to: "/ia", label: "AI Assistant", icon: "solar:chat-round-bold", end: false },
  { to: "/reportes", label: "Reportes", icon: "solar:file-text-bold", end: false },
];

function linkClass(isActive: boolean) {
  return [
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors border",
    isActive
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : "text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-white",
  ].join(" ");
}

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-zinc-800 bg-[#111827]">
      <div className="border-b border-zinc-800 px-6 py-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/20 to-red-500/5 shadow-sm shadow-red-500/10">
            <Icon icon="solar:cpu-bolt-bold" className="text-xl text-red-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                {BRAND_NAME}
              </h1>
              <span className="rounded-md border border-red-500/25 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                AI
              </span>
            </div>
            <p className="mt-1.5 text-[10px] leading-snug text-zinc-500">
              {BRAND_TAGLINE}
            </p>
            <p className="sr-only">{BRAND_NAME_AI}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => linkClass(isActive)}
              >
                <Icon icon={icon} className="text-xl shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-zinc-800 px-6 py-5">
        <p className="text-xs text-zinc-600">{BRAND_FOOTER}</p>
      </div>
    </aside>
  );
}
