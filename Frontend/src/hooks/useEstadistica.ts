import { useQuery } from "@tanstack/react-query";
import { obtenerEstadisticas } from "../api/estadisticaAPI";

export function useEstadistica() {
    return useQuery({
        queryKey: ['estadisticas'],
        queryFn: obtenerEstadisticas
    });
}

export default useEstadistica