import { obtenerEstadisticas } from "./estadisticasApi";
import type { ReportesResumen } from "../types/reportes.types";

export async function obtenerResumenReportes(): Promise<ReportesResumen> {
  const estadisticas = await obtenerEstadisticas();

  return {
    ...estadisticas,
    tasa_deteccion: estadisticas.porcentajes.verde,
  };
}
