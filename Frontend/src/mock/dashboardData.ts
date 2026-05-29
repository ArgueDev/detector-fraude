import { mockCases } from "./casesData";

export const dashboardStats = [
  {
    id: "total-siniestros",
    title: "Total Siniestros",
    value: "1,284",
    change: "+12.4%",
    trend: "up" as const,
    icon: "solar:document-text-bold",
    accent: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "casos-criticos",
    title: "Casos Críticos",
    value: "47",
    change: "+8 esta semana",
    trend: "up" as const,
    icon: "solar:danger-bold",
    accent: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    id: "score-promedio",
    title: "Score Promedio",
    value: "58.3",
    change: "-2.1 pts",
    trend: "down" as const,
    icon: "solar:graph-up-bold",
    accent: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    id: "monto-riesgo",
    title: "Monto en Riesgo",
    value: "$842K",
    change: "23% del total",
    trend: "neutral" as const,
    icon: "solar:wallet-money-bold",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

export const heroKpiBadges = [
  { label: "Alertas activas", value: "23", icon: "solar:bell-bing-bold" },
  { label: "ARIA activa", value: "ON", icon: "solar:cpu-bolt-bold" },
  { label: "Tasa detección", value: "94.5%", icon: "solar:target-bold" },
];

export const riskDonutData = [
  { name: "Riesgo Alto", value: 18, fill: "#ef4444" },
  { name: "Riesgo Medio", value: 32, fill: "#eab308" },
  { name: "Riesgo Bajo", value: 50, fill: "#22c55e" },
];

export const riskDonutCenter = {
  label: "RIESGO GENERAL",
  level: "BAJO",
  score: "94.5%",
};

export const topCriticalCases = mockCases
  .filter((c) => c.nivel_riesgo === "Rojo" || c.score_riesgo >= 65)
  .sort((a, b) => b.score_riesgo - a.score_riesgo)
  .slice(0, 5);

export const aiExplanation = {
  titulo: "Análisis IA — SIN-00003",
  score: 94,
  nivel: "Rojo",
  explicacion:
    "El modelo de detección identificó un patrón de alto riesgo asociado a documentación inconsistente y un proveedor con historial de alertas. La combinación de factores eleva la probabilidad de fraude por encima del umbral crítico.",
  bullets: [
    "Documentación duplicada detectada en facturas adjuntas",
    "Proveedor vinculado a 3 alertas en los últimos 6 meses",
    "Monto reclamado 2.4× superior al promedio del ramo",
    "Tiempo entre ocurrencia y reporte fuera del rango normal",
  ],
  alertas: ["ALT-001", "ALT-002", "ALT-005"],
  reasoning:
    "El score de 94 se compone de: anomalía documental (35%), historial proveedor (30%), monto atípico (20%) y patrón temporal (15%). Se recomienda auditoría forense antes de cualquier pago.",
};

export const topProvidersData = [
  { proveedor: "Taller AutoExpress", alertas: 12, fill: "#ef4444" },
  { proveedor: "Clínica San Rafael", alertas: 9, fill: "#f97316" },
  { proveedor: "Repuestos del Sur", alertas: 7, fill: "#eab308" },
  { proveedor: "Hospital Metropolitano", alertas: 5, fill: "#eab308" },
  { proveedor: "GlassFix Ecuador", alertas: 3, fill: "#22c55e" },
];

export const suspiciousPatternsData = [
  { patron: "Docs duplicadas", valor: 88 },
  { patron: "Monto atípico", valor: 72 },
  { patron: "Retraso reporte", valor: 65 },
  { patron: "Proveedor riesgo", valor: 91 },
  { patron: "Patrón geo", valor: 54 },
  { patron: "Beneficiarios", valor: 48 },
];

export const reportsSummary = {
  totalReportes: 12,
  generadosMes: 4,
  exportaciones: 28,
  resumenEjecutivo:
    "Durante el último trimestre, ARIA detectó un incremento del 12% en siniestros sospechosos, concentrados en ramos Vida y Automóvil. Los proveedores con mayor concentración de alertas operan principalmente en Cuenca y Guayaquil. Se recomienda reforzar controles en documentación de siniestros de robo e incendio.",
};

export const reportCards = [
  {
    id: "rep-1",
    titulo: "Informe Mensual ARIA",
    descripcion: "Resumen ejecutivo de métricas, alertas y casos críticos del mes.",
    fecha: "Mayo 2026",
    tipo: "PDF",
    icon: "solar:file-text-bold",
    metricas: { casos: 47, monto: "$842K", score: 58.3 },
  },
  {
    id: "rep-2",
    titulo: "Análisis de Proveedores",
    descripcion: "Ranking de proveedores con mayor índice de alertas activas.",
    fecha: "Abril 2026",
    tipo: "PDF",
    icon: "solar:users-group-rounded-bold",
    metricas: { casos: 23, monto: "$312K", score: 71.2 },
  },
  {
    id: "rep-3",
    titulo: "Patrones Sospechosos Q1",
    descripcion: "Detección de patrones recurrentes y tendencias por ramo.",
    fecha: "Marzo 2026",
    tipo: "PDF",
    icon: "solar:chart-2-bold",
    metricas: { casos: 89, monto: "$1.2M", score: 64.8 },
  },
  {
    id: "rep-4",
    titulo: "Auditoría Casos Críticos",
    descripcion: "Detalle forense de los 10 casos con mayor score de riesgo.",
    fecha: "Mayo 2026",
    tipo: "PDF",
    icon: "solar:shield-warning-bold",
    metricas: { casos: 10, monto: "$156K", score: 82.4 },
  },
];

export const reportMiniChartData = [
  { mes: "Ene", detectados: 32, resueltos: 28 },
  { mes: "Feb", detectados: 38, resueltos: 30 },
  { mes: "Mar", detectados: 45, resueltos: 35 },
  { mes: "Abr", detectados: 41, resueltos: 39 },
  { mes: "May", detectados: 47, resueltos: 33 },
];
