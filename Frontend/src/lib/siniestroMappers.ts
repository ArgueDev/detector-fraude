import type { CriticalCase } from "../types/criticalCase.types";
import type { Siniestro } from "../types/siniestro.types";
import type { TimelineEvent } from "../types/timeline.types";

export function mapSiniestroToCriticalCase(siniestro: Siniestro): CriticalCase {
  return {
    id: siniestro.id,
    id_siniestro: siniestro.id_siniestro,
    ramo: siniestro.ramo,
    score_riesgo: siniestro.score_riesgo,
    nivel_riesgo: siniestro.nivel_riesgo,
    cobertura: siniestro.cobertura,
    sucursal: siniestro.sucursal,
    monto_reclamado: siniestro.monto_reclamado,
  };
}

export function buildTimelineFromSiniestro(siniestro: Siniestro): TimelineEvent[] {
  const resuelto = siniestro.estado.toLowerCase() !== "negativa";

  return [
    {
      id: "tl-1",
      label: "Inicio póliza",
      fecha: `Póliza ${siniestro.id_poliza}`,
      descripcion: `${siniestro.dias_desde_inicio_poliza} días de vigencia al momento del siniestro`,
      completado: true,
    },
    {
      id: "tl-2",
      label: "Ocurrencia",
      fecha: siniestro.fecha_ocurrencia,
      descripcion: siniestro.descripcion,
      completado: true,
    },
    {
      id: "tl-3",
      label: "Reporte",
      fecha: siniestro.fecha_reporte,
      descripcion: `Reportado ${siniestro.dias_entre_ocurrencia_reporte} día(s) después de la ocurrencia`,
      completado: true,
    },
    {
      id: "tl-4",
      label: "Resolución",
      fecha: resuelto ? "En proceso / cerrado" : "Pendiente",
      descripcion: `Estado actual: ${siniestro.estado}`,
      completado: resuelto,
    },
  ];
}
