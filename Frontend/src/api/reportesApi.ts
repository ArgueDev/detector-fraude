import { obtenerEstadisticas } from "./estadisticasApi";
import type { Estadisticas } from "../types/estadisticas.types";

export type ReportesResumen = Estadisticas & {
  tasa_deteccion: number;
};

export async function obtenerResumenReportes(): Promise<ReportesResumen> {
  const estadisticas = await obtenerEstadisticas();

  return {
    ...estadisticas,
    tasa_deteccion: estadisticas.porcentajes.verde,
  };
}
