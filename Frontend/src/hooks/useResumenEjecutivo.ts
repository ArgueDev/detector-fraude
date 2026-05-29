// ─────────────────────────────────────────────────────────────────────────────
// useResumenEjecutivo.ts
// Wrapper sobre el endpoint /estadisticas/resumen-ejecutivo para ReportesPage.
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

export interface ResumenEjecutivo {
  resumen: {
    total_siniestros: number;
    casos_criticos_rojos: number;
    casos_revision_amarillos: number;
    porcentaje_en_riesgo: number;
    monto_total_reclamado: number;
    monto_en_riesgo: number;
    porcentaje_monto_riesgo: number;
    score_promedio_general: number;
  };
  top_siniestros_criticos: {
    id_siniestro: string;
    ramo: string;
    cobertura: string;
    monto_reclamado: number;
    score_riesgo: number;
    nivel_riesgo: string;
    alertas: string[];
    sucursal: string;
  }[];
  proveedores_con_mas_alertas: {
    id_proveedor: string;
    casos_sospechosos: number;
  }[];
  ramo_mas_critico: { ramo: string | null; casos_rojos: number };
  nota: string;
}

export function useResumenEjecutivo(topN = 10) {
  return useQuery({
    queryKey: ["reportes", "resumen-ejecutivo", topN],
    queryFn: () =>
      api
        .get<ResumenEjecutivo>("/estadisticas/resumen-ejecutivo", {
          params: { top_n: topN },
        })
        .then((r) => r.data),
  });
}