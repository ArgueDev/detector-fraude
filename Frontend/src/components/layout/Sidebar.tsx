import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";

const navItems = [
  { to: "/", label: "Dashboard", icon: "solar:chart-bold", end: true },
  { to: "/casos", label: "Casos Críticos", icon: "solar:danger-bold", end: false },
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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20">
            <Icon icon="solar:shield-check-bold" className="text-xl text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">FRAUDIA</h1>
            <p className="text-xs text-zinc-500 leading-snug mt-0.5">
              Detector Inteligente de Fraudes
            </p>
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
        <p className="text-xs text-zinc-600">FRAUDIA v1.0 · Antifraude IA</p>
      </div>
    </aside>
  );
}
