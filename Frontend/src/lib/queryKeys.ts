export const queryKeys = {
  estadisticas: ["estadisticas"] as const,
  ranking: (limit?: number) => ["siniestros", "ranking", limit] as const,
  siniestro: (id: string) => ["siniestros", id] as const,
  reportes: ["reportes"] as const,
  proveedoresAlertas: (limit: number) =>
    ["estadisticas", "proveedores-alertas", limit] as const,
  patronesRepetidos: ["estadisticas", "patrones-repetidos"] as const,
};
