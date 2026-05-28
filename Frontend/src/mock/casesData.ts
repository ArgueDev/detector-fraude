export type RiskLevel = "Rojo" | "Amarillo" | "Verde";

export type FraudCase = {
  id: number;
  id_siniestro: string;
  ramo: string;
  score_riesgo: number;
  nivel_riesgo: RiskLevel;
  cobertura: string;
  sucursal: string;
  monto_reclamado: number;
  monto_pagado: number;
  descripcion: string;
  fecha_inicio_poliza: string;
  fecha_ocurrencia: string;
  fecha_reporte: string;
  fecha_resolucion: string | null;
  estado: "Abierto" | "En revisión" | "Cerrado";
};

export type CaseAlert = {
  id: string;
  caseId: string;
  titulo: string;
  descripcion: string;
  nivel: RiskLevel;
  icono: string;
};

export type TimelineEvent = {
  id: string;
  label: string;
  fecha: string;
  descripcion: string;
  completado: boolean;
};

export const mockCases: FraudCase[] = [
  {
    id: 1,
    id_siniestro: "SIN-00003",
    ramo: "Vida",
    score_riesgo: 94,
    nivel_riesgo: "Rojo",
    cobertura: "Robo",
    sucursal: "Cuenca",
    monto_reclamado: 5992.75,
    monto_pagado: 0,
    descripcion: "Reclamo por robo con inconsistencias en declaración y documentación duplicada.",
    fecha_inicio_poliza: "2023-01-15",
    fecha_ocurrencia: "2025-11-02",
    fecha_reporte: "2025-11-05",
    fecha_resolucion: null,
    estado: "En revisión",
  },
  {
    id: 2,
    id_siniestro: "SIN-00007",
    ramo: "Automóvil",
    score_riesgo: 88,
    nivel_riesgo: "Rojo",
    cobertura: "Colisión",
    sucursal: "Quito",
    monto_reclamado: 18450.0,
    monto_pagado: 3200.0,
    descripcion: "Colisión reportada 48h después del siniestro. Taller no registrado en red.",
    fecha_inicio_poliza: "2024-03-10",
    fecha_ocurrencia: "2025-10-18",
    fecha_reporte: "2025-10-20",
    fecha_resolucion: null,
    estado: "Abierto",
  },
  {
    id: 3,
    id_siniestro: "SIN-00012",
    ramo: "Hogar",
    score_riesgo: 81,
    nivel_riesgo: "Rojo",
    cobertura: "Incendio",
    sucursal: "Guayaquil",
    monto_reclamado: 22100.5,
    monto_pagado: 0,
    descripcion: "Patrón de incendios recurrentes en la misma zona geográfica.",
    fecha_inicio_poliza: "2022-08-22",
    fecha_ocurrencia: "2025-09-30",
    fecha_reporte: "2025-10-01",
    fecha_resolucion: null,
    estado: "En revisión",
  },
  {
    id: 4,
    id_siniestro: "SIN-00015",
    ramo: "Salud",
    score_riesgo: 72,
    nivel_riesgo: "Amarillo",
    cobertura: "Hospitalización",
    sucursal: "Ambato",
    monto_reclamado: 8750.0,
    monto_pagado: 8750.0,
    descripcion: "Facturación elevada vs promedio del proveedor en el ramo.",
    fecha_inicio_poliza: "2023-06-01",
    fecha_ocurrencia: "2025-10-05",
    fecha_reporte: "2025-10-06",
    fecha_resolucion: "2025-10-28",
    estado: "Cerrado",
  },
  {
    id: 5,
    id_siniestro: "SIN-00018",
    ramo: "Vida",
    score_riesgo: 68,
    nivel_riesgo: "Amarillo",
    cobertura: "Muerte accidental",
    sucursal: "Cuenca",
    monto_reclamado: 45000.0,
    monto_pagado: 0,
    descripcion: "Beneficiarios con historial de reclamos en múltiples pólizas.",
    fecha_inicio_poliza: "2021-11-30",
    fecha_ocurrencia: "2025-09-12",
    fecha_reporte: "2025-09-15",
    fecha_resolucion: null,
    estado: "Abierto",
  },
  {
    id: 6,
    id_siniestro: "SIN-00021",
    ramo: "Automóvil",
    score_riesgo: 61,
    nivel_riesgo: "Amarillo",
    cobertura: "Robo total",
    sucursal: "Manta",
    monto_reclamado: 32000.0,
    monto_pagado: 15000.0,
    descripcion: "Vehículo reportado robado sin denuncia policial en plazo reglamentario.",
    fecha_inicio_poliza: "2024-01-08",
    fecha_ocurrencia: "2025-08-20",
    fecha_reporte: "2025-08-25",
    fecha_resolucion: null,
    estado: "En revisión",
  },
  {
    id: 7,
    id_siniestro: "SIN-00024",
    ramo: "Hogar",
    score_riesgo: 55,
    nivel_riesgo: "Amarillo",
    cobertura: "Daños por agua",
    sucursal: "Quito",
    monto_reclamado: 4100.25,
    monto_pagado: 4100.25,
    descripcion: "Daños reportados sin evidencia fotográfica suficiente.",
    fecha_inicio_poliza: "2023-09-14",
    fecha_ocurrencia: "2025-07-11",
    fecha_reporte: "2025-07-12",
    fecha_resolucion: "2025-08-01",
    estado: "Cerrado",
  },
  {
    id: 8,
    id_siniestro: "SIN-00028",
    ramo: "Salud",
    score_riesgo: 42,
    nivel_riesgo: "Verde",
    cobertura: "Consulta externa",
    sucursal: "Loja",
    monto_reclamado: 890.0,
    monto_pagado: 890.0,
    descripcion: "Reclamo dentro de parámetros normales del proveedor.",
    fecha_inicio_poliza: "2024-05-20",
    fecha_ocurrencia: "2025-06-03",
    fecha_reporte: "2025-06-04",
    fecha_resolucion: "2025-06-10",
    estado: "Cerrado",
  },
  {
    id: 9,
    id_siniestro: "SIN-00031",
    ramo: "Automóvil",
    score_riesgo: 38,
    nivel_riesgo: "Verde",
    cobertura: "Cristales",
    sucursal: "Guayaquil",
    monto_reclamado: 620.5,
    monto_pagado: 620.5,
    descripcion: "Daño menor con factura verificada en red autorizada.",
    fecha_inicio_poliza: "2024-11-01",
    fecha_ocurrencia: "2025-05-22",
    fecha_reporte: "2025-05-23",
    fecha_resolucion: "2025-05-30",
    estado: "Cerrado",
  },
  {
    id: 10,
    id_siniestro: "SIN-00035",
    ramo: "Vida",
    score_riesgo: 29,
    nivel_riesgo: "Verde",
    cobertura: "Invalidez",
    sucursal: "Quito",
    monto_reclamado: 12000.0,
    monto_pagado: 0,
    descripcion: "Evaluación médica pendiente. Sin señales de fraude detectadas.",
    fecha_inicio_poliza: "2020-04-12",
    fecha_ocurrencia: "2025-04-18",
    fecha_reporte: "2025-04-20",
    fecha_resolucion: null,
    estado: "Abierto",
  },
];

export const mockAlerts: CaseAlert[] = [
  {
    id: "ALT-001",
    caseId: "SIN-00003",
    titulo: "Documentación duplicada",
    descripcion: "Se detectaron dos facturas con el mismo número de serie.",
    nivel: "Rojo",
    icono: "solar:danger-triangle-bold",
  },
  {
    id: "ALT-002",
    caseId: "SIN-00003",
    titulo: "Proveedor en lista negra",
    descripcion: "El taller asociado tiene 3 alertas activas en los últimos 6 meses.",
    nivel: "Rojo",
    icono: "solar:shield-warning-bold",
  },
  {
    id: "ALT-003",
    caseId: "SIN-00007",
    titulo: "Retraso en reporte",
    descripcion: "El siniestro se reportó 48 horas después de la ocurrencia.",
    nivel: "Amarillo",
    icono: "solar:clock-circle-bold",
  },
  {
    id: "ALT-004",
    caseId: "SIN-00012",
    titulo: "Patrón geográfico",
    descripcion: "Cuarta incidencia de incendio en un radio de 2 km.",
    nivel: "Rojo",
    icono: "solar:map-point-wave-bold",
  },
  {
    id: "ALT-005",
    caseId: "SIN-00015",
    titulo: "Monto atípico",
    descripcion: "Facturación 340% superior al promedio del proveedor.",
    nivel: "Amarillo",
    icono: "solar:chart-2-bold",
  },
];

export function getTimelineForCase(caseId: string): TimelineEvent[] {
  const c = mockCases.find((x) => x.id_siniestro === caseId);
  if (!c) return [];

  return [
    {
      id: "tl-1",
      label: "Inicio póliza",
      fecha: c.fecha_inicio_poliza,
      descripcion: "Vigencia de la póliza activada.",
      completado: true,
    },
    {
      id: "tl-2",
      label: "Ocurrencia",
      fecha: c.fecha_ocurrencia,
      descripcion: "Fecha del evento asegurado.",
      completado: true,
    },
    {
      id: "tl-3",
      label: "Reporte",
      fecha: c.fecha_reporte,
      descripcion: "Siniestro reportado por el asegurado.",
      completado: true,
    },
    {
      id: "tl-4",
      label: "Resolución",
      fecha: c.fecha_resolucion ?? "Pendiente",
      descripcion: c.fecha_resolucion
        ? "Caso resuelto y cerrado."
        : "En proceso de investigación.",
      completado: !!c.fecha_resolucion,
    },
  ];
}

export const filterOptions = {
  niveles: ["Todos", "Rojo", "Amarillo", "Verde"] as const,
  sucursales: ["Todas", "Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Loja"],
  estados: ["Todos", "Abierto", "En revisión", "Cerrado"],
};
