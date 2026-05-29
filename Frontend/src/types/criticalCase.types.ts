import type { NivelRiesgo } from "./siniestro.types";

export type CriticalCase = {
  id: number;
  id_siniestro: string;
  ramo: string;
  score_riesgo: number;
  nivel_riesgo: NivelRiesgo;
  cobertura: string;
  sucursal: string;
  monto_reclamado: number;
};
