import { useQuery } from "@tanstack/react-query";
import { obtenerResumenReportes } from "../api/reportesApi";
import { queryKeys } from "../lib/queryKeys";

export function useReportes() {
  return useQuery({
    queryKey: queryKeys.reportes,
    queryFn: obtenerResumenReportes,
  });
}
