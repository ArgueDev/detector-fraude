import type { Estadisticas } from "./estadisticas.types";

export type ReportType = "monthly" | "providers" | "patterns" | "audit";

export type ReportMetricas = {
  casos: number;
  monto: string;
  score: number;
};

export type ReportCard = {
  id: string;
  reportType: ReportType;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: "PDF";
  icon: string;
  metricas: ReportMetricas;
};

export type ReportesResumen = Estadisticas & {
  tasa_deteccion: number;
};
