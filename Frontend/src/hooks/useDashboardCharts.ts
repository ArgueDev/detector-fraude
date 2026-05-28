import { useQuery } from "@tanstack/react-query";
import {
  obtenerPatronesRepetidos,
  obtenerProveedoresAlertas,
} from "../api/estadisticasApi";
import { queryKeys } from "../lib/queryKeys";

export function useProveedoresAlertas(limit = 8) {
  return useQuery({
    queryKey: queryKeys.proveedoresAlertas(limit),
    queryFn: () => obtenerProveedoresAlertas(limit),
  });
}

export function usePatronesRepetidos() {
  return useQuery({
    queryKey: queryKeys.patronesRepetidos,
    queryFn: obtenerPatronesRepetidos,
  });
}
