"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";


// ── Types ─────────────────────────────────────────────────────────────────────
interface Proveedor {
  id_proveedor: string;
  tipo: string;
  ciudad: string | null;
  total_siniestros_sospechosos: number;
  casos_rojos: number;
  casos_amarillos: number;
  monto_total: number;
  score_promedio: number;
  en_lista_restrictiva: boolean;
}

interface Ramo {
  ramo: string;
  total_siniestros: number;
  casos_rojos: number;
  casos_amarillos: number;
  total_sospechosos: number;
  porcentaje_sospechoso: number;
  monto_total: number;
}

interface Ciudad {
  ciudad: string;
  total_alertas: number;
  casos_rojos: number;
  casos_amarillos: number;
  monto_total: number;
}

interface Asegurado {
  id_asegurado: string;
  segmento: string | null;
  ciudad: string | null;
  score_cliente: number | null;
  mora_actual: boolean | null;
  total_siniestros_sospechosos: number;
  casos_rojos: number;
  monto_total: number;
}

interface MontoAtipico {
  id_siniestro: string;
  ramo: string;
  cobertura: string;
  monto_reclamado: number;
  suma_asegurada: number;
  ratio_vs_suma: number;
  nivel_riesgo: string;
}

interface DocumentoTipo {
  tipo_documento: string;
  total: number;
  no_entregados: number;
  ilegibles: number;
  con_inconsistencias: number;
}

interface Patron {
  patron: string;
  frecuencia: number;
  porcentaje: number;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  subtitle,
  children,
  accent = "red",
}: {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accent?: "red" | "amber" | "blue" | "emerald";
}) {
  const colors = {
    red: "text-red-400 bg-red-500/15 border-red-500/20 from-red-500/5",
    amber: "text-amber-400 bg-amber-500/15 border-amber-500/20 from-amber-500/5",
    blue: "text-blue-400 bg-blue-500/15 border-blue-500/20 from-blue-500/5",
    emerald: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20 from-emerald-500/5",
  };
  const c = colors[accent];
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#111827] shadow-sm">
      <div className={`flex items-center gap-3 border-b border-zinc-800 bg-gradient-to-r ${c.split(" ")[3]} to-transparent px-6 py-5`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.split(" ")[1]} border ${c.split(" ")[2]}`}>
          <Icon icon={icon} className={`text-xl ${c.split(" ")[0]}`} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function LoadingRow() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-10 animate-pulse rounded-xl bg-zinc-800/60" />
      ))}
    </div>
  );
}

function NivelBadge({ nivel }: { nivel: string }) {
  if (nivel === "Rojo")
    return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">Rojo</span>;
  if (nivel === "Amarillo")
    return <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">Amarillo</span>;
  return <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">Verde</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalisisRiesgoPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [ramos, setRamos] = useState<Ramo[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [asegurados, setAsegurados] = useState<Asegurado[]>([]);
  const [montos, setMontos] = useState<MontoAtipico[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoTipo[]>([]);
  const [patrones, setPatrones] = useState<Patron[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prov, ram, ciu, ase, mon, doc, pat] = await Promise.allSettled([
          fetch(`${API}/estadisticas/proveedores-alertas?limit=10`).then((r) => r.json()),
          fetch(`${API}/estadisticas/ramos-sospechosos`).then((r) => r.json()),
          fetch(`${API}/estadisticas/ciudades-alertas?limit=10`).then((r) => r.json()),
          fetch(`${API}/estadisticas/asegurados-frecuentes?limit=10`).then((r) => r.json()),
          fetch(`${API}/estadisticas/montos-atipicos?limit=15`).then((r) => r.json()),
          fetch(`${API}/estadisticas/documentos-faltantes`).then((r) => r.json()),
          fetch(`${API}/estadisticas/patrones-repetidos`).then((r) => r.json()),
        ]);

        if (prov.status === "fulfilled") setProveedores(prov.value.items ?? []);
        if (ram.status === "fulfilled") setRamos(ram.value.items ?? []);
        if (ciu.status === "fulfilled") setCiudades(ciu.value.items ?? []);
        if (ase.status === "fulfilled") setAsegurados(ase.value.items ?? []);
        if (mon.status === "fulfilled") setMontos(mon.value.items ?? []);
        if (doc.status === "fulfilled") setDocumentos(doc.value.por_tipo_documento ?? []);
        if (pat.status === "fulfilled") setPatrones(pat.value.patrones ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const maxPatron = patrones[0]?.frecuencia ?? 1;

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Análisis de Riesgo</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Patrones, concentración de alertas y anomalías detectadas en todo el dataset
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Proveedores */}
        <SectionCard
          icon="solar:buildings-3-bold"
          title="Proveedores con más alertas"
          subtitle="Ranking por volumen de casos sospechosos"
          accent="red"
        >
          {loading ? (
            <LoadingRow />
          ) : (
            <div className="space-y-2">
              {proveedores.map((p) => (
                <div
                  key={p.id_proveedor}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#0b1120]/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {p.en_lista_restrictiva && (
                      <Icon icon="solar:danger-bold" className="shrink-0 text-red-400" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {p.id_proveedor}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {p.tipo} · {p.ciudad ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{p.casos_rojos} rojos</p>
                      <p className="text-xs text-zinc-500">
                        ${p.monto_total.toLocaleString("es-EC", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    {p.en_lista_restrictiva && (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-bold text-red-400 border border-red-500/20">
                        RESTRICTIVA
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Ramos */}
        <SectionCard
          icon="solar:chart-2-bold"
          title="Ramos por % sospechoso"
          subtitle="Porcentaje de casos de riesgo por ramo"
          accent="amber"
        >
          {loading ? (
            <LoadingRow />
          ) : (
            <div className="space-y-3">
              {ramos.map((r) => (
                <div key={r.ramo}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{r.ramo}</span>
                    <span className="text-xs font-bold text-amber-400">
                      {r.porcentaje_sospechoso}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-700"
                      style={{ width: `${Math.min(r.porcentaje_sospechoso, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-zinc-500">
                    <span>{r.casos_rojos} rojos</span>
                    <span>{r.casos_amarillos} amarillos</span>
                    <span>de {r.total_siniestros}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Ciudades */}
        <SectionCard
          icon="solar:map-point-bold"
          title="Ciudades con más alertas"
          subtitle="Concentración geográfica de casos sospechosos"
          accent="blue"
        >
          {loading ? (
            <LoadingRow />
          ) : (
            <div className="space-y-2">
              {ciudades.map((c, i) => (
                <div
                  key={c.ciudad}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-[#0b1120]/60 px-4 py-3"
                >
                  <span className="w-5 shrink-0 text-center text-sm font-bold text-zinc-600">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{c.ciudad}</p>
                    <p className="text-xs text-zinc-500">
                      {c.total_alertas} alertas · ${c.monto_total.toLocaleString("es-EC", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
                      {c.casos_rojos}🔴
                    </span>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                      {c.casos_amarillos}🟡
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Asegurados frecuentes */}
        <SectionCard
          icon="solar:user-bold"
          title="Asegurados frecuentes"
          subtitle="Mayor concentración de siniestros sospechosos"
          accent="red"
        >
          {loading ? (
            <LoadingRow />
          ) : (
            <div className="space-y-2">
              {asegurados.map((a) => (
                <div
                  key={a.id_asegurado}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#0b1120]/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{a.id_asegurado}</p>
                    <p className="text-xs text-zinc-500">
                      {a.segmento ?? "—"} · {a.ciudad ?? "—"} · score cliente:{" "}
                      <span className="text-zinc-300">{a.score_cliente ?? "N/D"}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-red-400">
                      {a.total_siniestros_sospechosos} casos
                    </p>
                    <p className="text-xs text-zinc-500">
                      ${a.monto_total.toLocaleString("es-EC", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Montos atípicos */}
      <SectionCard
        icon="solar:dollar-minimalistic-bold"
        title="Montos atípicos"
        subtitle="Siniestros con monto reclamado cercano o superior a la suma asegurada"
        accent="amber"
      >
        {loading ? (
          <LoadingRow />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="pb-3 pr-4">Siniestro</th>
                  <th className="pb-3 pr-4">Ramo</th>
                  <th className="pb-3 pr-4">Cobertura</th>
                  <th className="pb-3 pr-4 text-right">Monto rec.</th>
                  <th className="pb-3 pr-4 text-right">Suma aseg.</th>
                  <th className="pb-3 pr-4 text-right">Ratio</th>
                  <th className="pb-3">Nivel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {montos.map((m) => (
                  <tr key={m.id_siniestro} className="group hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 pr-4 font-mono text-white">{m.id_siniestro}</td>
                    <td className="py-3 pr-4 text-zinc-300">{m.ramo}</td>
                    <td className="py-3 pr-4 text-zinc-400">{m.cobertura}</td>
                    <td className="py-3 pr-4 text-right font-medium text-white">
                      ${m.monto_reclamado.toLocaleString("es-EC", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400">
                      ${m.suma_asegurada.toLocaleString("es-EC", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`font-bold ${m.ratio_vs_suma >= 95 ? "text-red-400" : "text-amber-400"}`}>
                        {m.ratio_vs_suma}%
                      </span>
                    </td>
                    <td className="py-3">
                      <NivelBadge nivel={m.nivel_riesgo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Documentos */}
        <SectionCard
          icon="solar:document-bold"
          title="Documentos faltantes"
          subtitle="Problemas documentales en casos críticos"
          accent="red"
        >
          {loading ? (
            <LoadingRow />
          ) : (
            <div className="space-y-3">
              {documentos.map((d) => (
                <div key={d.tipo_documento} className="rounded-xl border border-zinc-800 bg-[#0b1120]/60 p-4">
                  <p className="mb-2 text-sm font-medium text-white">{d.tipo_documento}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-red-400">{d.con_inconsistencias}</p>
                      <p className="text-xs text-zinc-500">Inconsistentes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-400">{d.no_entregados}</p>
                      <p className="text-xs text-zinc-500">No entregados</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-zinc-400">{d.ilegibles}</p>
                      <p className="text-xs text-zinc-500">Ilegibles</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Patrones */}
        <SectionCard
          icon="solar:radar-2-bold"
          title="Patrones repetidos"
          subtitle="Alertas más frecuentes en casos sospechosos"
          accent="emerald"
        >
          {loading ? (
            <LoadingRow />
          ) : (
            <div className="space-y-3">
              {patrones.slice(0, 8).map((p) => (
                <div key={p.patron}>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-xs text-zinc-300 leading-snug">{p.patron}</span>
                    <span className="shrink-0 text-xs font-bold text-emerald-400">
                      {p.porcentaje}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-700"
                      style={{ width: `${(p.frecuencia / maxPatron) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-600">{p.frecuencia} casos</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}