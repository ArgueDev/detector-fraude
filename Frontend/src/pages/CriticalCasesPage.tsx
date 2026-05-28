import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import PageHeader from "../components/layout/PageHeader";
import CriticalCasesTable from "../components/dashboard/CriticalCasesTable";
import RiskBadge from "../components/dashboard/RiskBadge";
import AlertsList from "../components/cases/AlertsList";
import CaseDetailsCard from "../components/cases/CaseDetailsCard";
import TimelineCard from "../components/cases/TimelineCard";
import {
  filterOptions,
  getTimelineForCase,
  mockAlerts,
  mockCases,
  type RiskLevel,
} from "../mock/casesData";

export default function CriticalCasesPage() {
  const [searchParams] = useSearchParams();
  const initialCase =
    searchParams.get("caso") ?? mockCases[0]?.id_siniestro ?? "";

  const [search, setSearch] = useState("");
  const [nivel, setNivel] = useState<string>("Todos");
  const [sucursal, setSucursal] = useState("Todas");
  const [estado, setEstado] = useState("Todos");
  const [selectedId, setSelectedId] = useState(initialCase);

  const filtered = useMemo(() => {
    return mockCases.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.id_siniestro.toLowerCase().includes(q) ||
        c.ramo.toLowerCase().includes(q) ||
        c.cobertura.toLowerCase().includes(q);
      const matchNivel = nivel === "Todos" || c.nivel_riesgo === nivel;
      const matchSucursal = sucursal === "Todas" || c.sucursal === sucursal;
      const matchEstado = estado === "Todos" || c.estado === estado;
      return matchSearch && matchNivel && matchSucursal && matchEstado;
    });
  }, [search, nivel, sucursal, estado]);

  const selected =
    mockCases.find((c) => c.id_siniestro === selectedId) ?? filtered[0];

  const caseAlerts = mockAlerts.filter((a) => a.caseId === selected?.id_siniestro);

  const summary = {
    total: mockCases.length,
    rojos: mockCases.filter((c) => c.nivel_riesgo === "Rojo").length,
    abiertos: mockCases.filter((c) => c.estado === "Abierto").length,
    monto: mockCases.reduce((s, c) => s + c.monto_reclamado, 0),
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Investigación"
        title="Casos críticos"
        description="Panel de investigación para priorizar, filtrar y analizar siniestros de alto riesgo."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total casos", value: summary.total, icon: "solar:folder-bold" },
          { label: "Nivel rojo", value: summary.rojos, icon: "solar:danger-bold" },
          { label: "Abiertos", value: summary.abiertos, icon: "solar:clock-circle-bold" },
          {
            label: "Monto reclamado",
            value: `$${summary.monto.toLocaleString()}`,
            icon: "solar:wallet-bold",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-zinc-800 bg-[#111827] p-5 transition-all duration-200 hover:border-zinc-700"
          >
            <Icon icon={card.icon} className="text-xl text-red-400" />
            <p className="mt-3 text-xs text-zinc-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-[#111827] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:p-5">
        <div className="relative min-w-[200px] flex-1">
          <Icon
            icon="solar:magnifer-bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar siniestro, ramo, cobertura..."
            className="w-full rounded-xl border border-zinc-800 bg-[#0b1120] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/30 focus:outline-none"
          />
        </div>
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-[#0b1120] px-4 py-2.5 text-sm text-zinc-300 focus:outline-none"
        >
          {filterOptions.niveles.map((n) => (
            <option key={n} value={n}>
              Nivel: {n}
            </option>
          ))}
        </select>
        <select
          value={sucursal}
          onChange={(e) => setSucursal(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-[#0b1120] px-4 py-2.5 text-sm text-zinc-300 focus:outline-none"
        >
          {filterOptions.sucursales.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-[#0b1120] px-4 py-2.5 text-sm text-zinc-300 focus:outline-none"
        >
          {filterOptions.estados.map((e) => (
            <option key={e} value={e}>
              Estado: {e}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["Rojo", "Amarillo", "Verde"] as RiskLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setNivel(lvl)}
                className="transition-all duration-200"
              >
                <RiskBadge level={lvl} />
              </button>
            ))}
          </div>

          <div
            onClick={(e) => {
              const row = (e.target as HTMLElement).closest("[data-case-id]");
              if (row) setSelectedId(row.getAttribute("data-case-id") ?? "");
            }}
          >
            <CriticalCasesTable cases={filtered} showAction={false} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                data-case-id={c.id_siniestro}
                onClick={() => setSelectedId(c.id_siniestro)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                  selected?.id_siniestro === c.id_siniestro
                    ? "border-red-500/30 bg-red-500/10 text-white"
                    : "border-zinc-800 bg-[#111827] text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <span className="font-semibold">{c.id_siniestro}</span>
                <span className="ml-2 text-zinc-500">· {c.score_riesgo} pts</span>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <aside className="space-y-6">
            <CaseDetailsCard caseData={selected} />
            <section className="rounded-3xl border border-zinc-800 bg-[#111827] p-6">
              <h3 className="text-sm font-semibold text-white">Alertas activadas</h3>
              <div className="mt-4">
                <AlertsList alerts={caseAlerts} />
              </div>
            </section>
            <TimelineCard events={getTimelineForCase(selected.id_siniestro)} />
          </aside>
        )}
      </div>
    </div>
  );
}
