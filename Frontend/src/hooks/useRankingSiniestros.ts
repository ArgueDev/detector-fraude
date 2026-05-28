import { useQuery } from "@tanstack/react-query";
import { obtenerRankingSiniestros } from "../api/siniestrosApi";
import { queryKeys } from "../lib/queryKeys";

export function useRankingSiniestros(limit = 10) {
  return useQuery({
    queryKey: queryKeys.ranking(limit),
    queryFn: () => obtenerRankingSiniestros(limit),
  });
}
