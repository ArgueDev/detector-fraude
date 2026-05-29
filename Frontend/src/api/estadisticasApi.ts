import api from "../lib/axios";
import { parseApiResponse } from "../lib/parseApi";
import { estadisticasSchema } from "../schemas/estadisticas.schema";
import { patronesResponseSchema } from "../schemas/patrones.schema";
import { proveedoresAlertasResponseSchema } from "../schemas/proveedores.schema";
import type { Estadisticas } from "../types/estadisticas.types";
import type { z } from "zod";

export type PatronesResponse = z.infer<typeof patronesResponseSchema>;
export type ProveedoresAlertasResponse = z.infer<
  typeof proveedoresAlertasResponseSchema
>;

export async function obtenerEstadisticas(): Promise<Estadisticas> {
  const { data } = await api.get("/estadisticas/");
  return parseApiResponse(estadisticasSchema, data);
}

export async function obtenerProveedoresAlertas(
  limit = 8
): Promise<ProveedoresAlertasResponse> {
  const { data } = await api.get("/estadisticas/proveedores-alertas", {
    params: { limit },
  });
  return parseApiResponse(proveedoresAlertasResponseSchema, data);
}

export async function obtenerPatronesRepetidos(): Promise<PatronesResponse> {
  const { data } = await api.get("/estadisticas/patrones-repetidos");
  return parseApiResponse(patronesResponseSchema, data);
}
