import { z } from "zod";

export const patronesResponseSchema = z.object({
  total_casos_analizados: z.number(),
  patrones: z.array(
    z.object({
      patron: z.string(),
      frecuencia: z.number(),
      porcentaje: z.number(),
    })
  ),
});
