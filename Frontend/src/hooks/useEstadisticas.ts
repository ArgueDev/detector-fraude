import { useQuery } from "@tanstack/react-query";
import { obtenerEstadisticas } from "../api/estadisticasApi";
import { queryKeys } from "../lib/queryKeys";

export function useEstadisticas() {
  return useQuery({
    queryKey: queryKeys.estadisticas,
    queryFn: obtenerEstadisticas,
  });
}
