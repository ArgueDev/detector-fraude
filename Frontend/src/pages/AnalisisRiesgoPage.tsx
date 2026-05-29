
import PageHeader from "../components/layout/PageHeader";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useProveedoresRiesgo,
  useRamosRiesgo,
  useCiudadesRiesgo,
  useDocumentosFaltantes,
  usePatronesRepetidosRiesgo,
} from "../hooks/useAnalisisRiesgo";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#38bdf8", "#a78bfa", "#fb7185"];

export default function AnalisisRiesgoPage() {
  const proveedores = useProveedoresRiesgo(6);
  const ramos = useRamosRiesgo();
  const ciudades = useCiudadesRiesgo(6);
  const documentos = useDocumentosFaltantes();
  const patrones = usePatronesRepetidosRiesgo();

  const proveedoresData = (proveedores.data ?? []).map((item) => ({
    name: item.id_proveedor,
    alertas: item.total_siniestros_sospechosos,
    rojos: item.casos_rojos,
  }));

  const ramosData = (ramos.data ?? []).map((item) => ({
    name: item.ramo,
    value: item.total_sospechosos,
  }));

  const ciudadesData = (ciudades.data ?? []).map((item) => ({
    name: item.ciudad,
    alertas: item.total_alertas,
  }));

  const _docsData = (documentos.data ?? []).map((item) => ({
    name: item.tipo_documento,
    value: item.no_entregados,
  }));

  const _patronesData = (patrones.data ?? []).map((item) => ({
    name: item.patron,
    value: item.frecuencia,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Análisis"
        title="Análisis de Riesgo"
        description="KPIs de riesgo, alertas y patrones detectados por ARIA."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm shadow-black/20">
          <div className="mb-4">
            
            <h2 className="mt-1 text-xl font-semibold text-white">Proveedores con más alertas</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={proveedoresData}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #27272a", color: "#fff" }} />
                <Bar dataKey="alertas" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm shadow-black/20">
          <div className="mb-4">
            
            <h2 className="mt-1 text-xl font-semibold text-white">Distribución de ramos sospechosos</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ramosData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {ramosData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #27272a", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm shadow-black/20">
          <div className="mb-4">
            
            <h2 className="mt-1 text-xl font-semibold text-white">Ciudades con mayor alerta</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ciudadesData}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #27272a", color: "#fff" }} />
                <Bar dataKey="alertas" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* <article className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 shadow-sm shadow-black/20">
          <div className="mb-4">
            
            <h2 className="mt-1 text-xl font-semibold text-white">Documentos faltantes</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={docsData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={90} paddingAngle={2}>
                  {docsData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #27272a", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article> */}
      </div>


      <article className="rounded-3xl border border-zinc-800 bg-[#111827] p-6 mt-8 shadow-sm shadow-black/20 overflow-x-auto">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-red-400">Detalle</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Detalle de datos</h2>
        </div>
        <div className="space-y-8">
          {/* Proveedores */}
          <div>
            <h3 className="font-bold text-base mb-2 text-red-400">Proveedores con más alertas</h3>
            <table className="min-w-[600px] w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900">
                  <th className="p-2">ID</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Ciudad</th>
                  <th className="p-2">Sospechosos</th>
                  <th className="p-2">Rojos</th>
                  <th className="p-2">Amarillos</th>
                  <th className="p-2">Monto Total</th>
                  <th className="p-2">Score Promedio</th>
                  <th className="p-2">Restrictiva</th>
                </tr>
              </thead>
              <tbody>
                {(proveedores.data ?? []).map((p, i) => (
                  <tr key={p.id_proveedor} className={i % 2 ? "bg-zinc-800" : ""}>
                    <td className="p-2">{p.id_proveedor}</td>
                    <td className="p-2">{p.tipo}</td>
                    <td className="p-2">{p.ciudad}</td>
                    <td className="p-2">{p.total_siniestros_sospechosos}</td>
                    <td className="p-2">{p.casos_rojos}</td>
                    <td className="p-2">{p.casos_amarillos}</td>
                    <td className="p-2">${p.monto_total.toLocaleString()}</td>
                    <td className="p-2">{p.score_promedio}</td>
                    <td className="p-2">{p.en_lista_restrictiva ? "Sí" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ramos */}
          <div>
            <h3 className="font-bold text-base mb-2 text-red-400">Ramos sospechosos</h3>
            <table className="min-w-[600px] w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900">
                  <th className="p-2">Ramo</th>
                  <th className="p-2">Total Siniestros</th>
                  <th className="p-2">Rojos</th>
                  <th className="p-2">Amarillos</th>
                  <th className="p-2">Sospechosos</th>
                  <th className="p-2">% Sospechoso</th>
                  <th className="p-2">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {(ramos.data ?? []).map((r, i) => (
                  <tr key={r.ramo} className={i % 2 ? "bg-zinc-800" : ""}>
                    <td className="p-2">{r.ramo}</td>
                    <td className="p-2">{r.total_siniestros}</td>
                    <td className="p-2">{r.casos_rojos}</td>
                    <td className="p-2">{r.casos_amarillos}</td>
                    <td className="p-2">{r.total_sospechosos}</td>
                    <td className="p-2">{r.porcentaje_sospechoso}%</td>
                    <td className="p-2">${r.monto_total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ciudades */}
          <div>
            <h3 className="font-bold text-base mb-2 text-red-400">Ciudades con mayor alerta</h3>
            <table className="min-w-[400px] w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900">
                  <th className="p-2">Ciudad</th>
                  <th className="p-2">Total Alertas</th>
                  <th className="p-2">Rojos</th>
                  <th className="p-2">Amarillos</th>
                  <th className="p-2">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {(ciudades.data ?? []).map((c, i) => (
                  <tr key={c.ciudad} className={i % 2 ? "bg-zinc-800" : ""}>
                    <td className="p-2">{c.ciudad}</td>
                    <td className="p-2">{c.total_alertas}</td>
                    <td className="p-2">{c.casos_rojos}</td>
                    <td className="p-2">{c.casos_amarillos}</td>
                    <td className="p-2">${c.monto_total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Documentos */}
          {/* <div>
            <h3 className="font-bold text-base mb-2 text-red-400">Documentos faltantes</h3>
            <table className="min-w-[400px] w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900">
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">No entregados</th>
                  <th className="p-2">Ilegibles</th>
                  <th className="p-2">Inconsistencias</th>
                </tr>
              </thead>
              <tbody>
                {(documentos.data ?? []).map((d, i) => (
                  <tr key={d.tipo_documento} className={i % 2 ? "bg-zinc-800" : ""}>
                    <td className="p-2">{d.tipo_documento}</td>
                    <td className="p-2">{d.total}</td>
                    <td className="p-2">{d.no_entregados}</td>
                    <td className="p-2">{d.ilegibles}</td>
                    <td className="p-2">{d.con_inconsistencias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}

          {/* Patrones */}
          <div>
            <h3 className="font-bold text-base mb-2 text-red-400">Patrones repetidos</h3>
            <table className="min-w-[400px] w-full text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900">
                  <th className="p-2">Patrón</th>
                  <th className="p-2">Frecuencia</th>
                  <th className="p-2">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {(patrones.data ?? []).map((p, i) => (
                  <tr key={p.patron} className={i % 2 ? "bg-zinc-800" : ""}>
                    <td className="p-2">{p.patron}</td>
                    <td className="p-2">{p.frecuencia}</td>
                    <td className="p-2">{p.porcentaje}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </div>
  );
}
