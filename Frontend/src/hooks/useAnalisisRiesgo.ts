// ─────────────────────────────────────────────────────────────────────────────
// useAnalisisRiesgo.ts
// Centraliza todas las llamadas de la Tab "Análisis de Riesgo".
// Usa la instancia axios configurada (timeout, interceptores de error, baseURL).
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Proveedor {
  id_proveedor: string;
  tipo: string;
  ciudad: string | null;
  total_siniestros_sospechosos: number;
  casos_rojos: number;
  casos_amarillos: number;
  monto_total: number;
  score_promedio: number;
  en_lista_restrictiva: boolean;
}

export interface Ramo {
  ramo: string;
  total_siniestros: number;
  casos_rojos: number;
  casos_amarillos: number;
  total_sospechosos: number;
  porcentaje_sospechoso: number;
  monto_total: number;
}

export interface Ciudad {
  ciudad: string;
  total_alertas: number;
  casos_rojos: number;
  casos_amarillos: number;
  monto_total: number;
}

export interface Asegurado {
  id_asegurado: string;
  segmento: string | null;
  ciudad: string | null;
  score_cliente: number | null;
  mora_actual: boolean | null;
  total_siniestros_sospechosos: number;
  casos_rojos: number;
  monto_total: number;
}

export interface MontoAtipico {
  id_siniestro: string;
  ramo: string;
  cobertura: string;
  monto_reclamado: number;
  suma_asegurada: number;
  ratio_vs_suma: number;
  nivel_riesgo: string;
}

export interface DocumentoTipo {
  tipo_documento: string;
  total: number;
  no_entregados: number;
  ilegibles: number;
  con_inconsistencias: number;
}

export interface Patron {
  patron: string;
  frecuencia: number;
  porcentaje: number;
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

const fetchProveedores = (limit: number): Promise<Proveedor[]> =>
  api
    .get<{ items: Proveedor[] }>(`/estadisticas/proveedores-alertas`, { params: { limit } })
    .then((r) => r.data.items ?? []);

const fetchRamos = (): Promise<Ramo[]> =>
  api
    .get<{ items: Ramo[] }>(`/estadisticas/ramos-sospechosos`)
    .then((r) => r.data.items ?? []);

const fetchCiudades = (limit: number): Promise<Ciudad[]> =>
  api
    .get<{ items: Ciudad[] }>(`/estadisticas/ciudades-alertas`, { params: { limit } })
    .then((r) => r.data.items ?? []);

const fetchAsegurados = (limit: number): Promise<Asegurado[]> =>
  api
    .get<{ items: Asegurado[] }>(`/estadisticas/asegurados-frecuentes`, { params: { limit } })
    .then((r) => r.data.items ?? []);

const fetchMontosAtipicos = (limit: number): Promise<MontoAtipico[]> =>
  api
    .get<{ items: MontoAtipico[] }>(`/estadisticas/montos-atipicos`, { params: { limit } })
    .then((r) => r.data.items ?? []);

const fetchDocumentos = (): Promise<DocumentoTipo[]> =>
  api
    .get<{ por_tipo_documento: DocumentoTipo[] }>(`/estadisticas/documentos-faltantes`)
    .then((r) => r.data.por_tipo_documento ?? []);

const fetchPatrones = (): Promise<Patron[]> =>
  api
    .get<{ patrones: Patron[] }>(`/estadisticas/patrones-repetidos`)
    .then((r) => r.data.patrones ?? []);

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useProveedoresRiesgo(limit = 10) {
  return useQuery({
    queryKey: ["analisis", "proveedores", limit],
    queryFn: () => fetchProveedores(limit),
  });
}

export function useRamosRiesgo() {
  return useQuery({
    queryKey: ["analisis", "ramos"],
    queryFn: fetchRamos,
  });
}

export function useCiudadesRiesgo(limit = 10) {
  return useQuery({
    queryKey: ["analisis", "ciudades", limit],
    queryFn: () => fetchCiudades(limit),
  });
}

export function useAseguradosFrecuentes(limit = 10) {
  return useQuery({
    queryKey: ["analisis", "asegurados", limit],
    queryFn: () => fetchAsegurados(limit),
  });
}

export function useMontosAtipicos(limit = 15) {
  return useQuery({
    queryKey: ["analisis", "montos", limit],
    queryFn: () => fetchMontosAtipicos(limit),
  });
}

export function useDocumentosFaltantes() {
  return useQuery({
    queryKey: ["analisis", "documentos"],
    queryFn: fetchDocumentos,
  });
}

export function usePatronesRepetidosRiesgo() {
  return useQuery({
    queryKey: ["analisis", "patrones"],
    queryFn: fetchPatrones,
  });
}