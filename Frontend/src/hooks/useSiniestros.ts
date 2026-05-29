// ─────────────────────────────────────────────────────────────────────────────
// useSiniestros.ts
// Paginación de siniestros con filtros + mutación recalcular-todos.
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Siniestro {
  id_siniestro: string;
  id_poliza: string;
  id_asegurado: string;
  ramo: string;
  cobertura: string;
  estado: string;
  sucursal: string;
  fecha_ocurrencia: string;
  fecha_reporte: string;
  monto_reclamado: number;
  monto_estimado: number;
  score_riesgo: number;
  nivel_riesgo: string;
  alertas_activadas: string | string[];
  documentos_completos: boolean;
  descripcion: string;
  historial_siniestros_asegurado: number;
  dias_desde_inicio_poliza: number;
  dias_desde_fin_poliza: number;
  dias_entre_ocurrencia_reporte: number;
  tipo_fraude_simulado: string;
}

export interface SiniestrosPage {
  items: Siniestro[];
  total: number;
}

export interface SiniestrosFiltros {
  nivel_riesgo?: string;
  ramo?: string;
  limit: number;
  offset: number;
}

// ── Hook: lista paginada ───────────────────────────────────────────────────────

export function useSiniestros(filtros: SiniestrosFiltros) {
  return useQuery({
    queryKey: ["siniestros", "lista", filtros],
    queryFn: () =>
      api
        .get<SiniestrosPage>("/siniestros/", { params: filtros })
        .then((r) => r.data),
    placeholderData: (prev) => prev, // mantiene datos anteriores al paginar
  });
}

// ── Hook: recalcular todos ────────────────────────────────────────────────────

export function useRecalcularTodos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/siniestros/recalcular-todos"),
    onSuccess: () => {
      // Invalida toda la caché de siniestros para refrescar la tabla
      queryClient.invalidateQueries({ queryKey: ["siniestros"] });
    },
  });
}

// ── Hook: CSV críticos (descarga, no es query) ────────────────────────────────

export async function descargarCsvCriticos(): Promise<void> {
  const res = await api.get<SiniestrosPage>("/siniestros/", {
    params: { nivel_riesgo: "Rojo", limit: 200 },
  });
  const items = res.data.items ?? [];
  if (!items.length) return;

  const headers = Object.keys(items[0]).join(",");
  const rows = items.map((row) =>
    Object.values(row)
      .map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v))
      .join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `casos-criticos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}