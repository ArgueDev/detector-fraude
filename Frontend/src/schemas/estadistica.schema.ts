import { z } from "zod";

export const estadisticasSchema = z.object({
    total_siniestros: z.number(),

    por_nivel: z.object({
        rojo: z.number(),
        amarillo: z.number(),
        verde: z.number(),
        sin_score: z.number(),
    }),

    porcentajes: z.object({
        rojo: z.number(),
        amarillo: z.number(),
        verde: z.number(),
    }),

    montos: z.object({
        total_reclamado: z.number(),
        en_casos_sospechosos: z.number(),
        porcentaje_en_riesgo: z.number(),
    }),

    score_promedio: z.number(),
});