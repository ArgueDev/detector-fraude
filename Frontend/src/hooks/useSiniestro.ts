import { useQuery } from "@tanstack/react-query";
import { obtenerSiniestroPorId } from "../api/siniestrosApi";
import { queryKeys } from "../lib/queryKeys";

export function useSiniestro(idSiniestro: string | null) {
  return useQuery({
    queryKey: queryKeys.siniestro(idSiniestro ?? ""),
    queryFn: () => obtenerSiniestroPorId(idSiniestro!),
    enabled: Boolean(idSiniestro),
  });
}
