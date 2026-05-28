import { z } from "zod";

export const proveedoresAlertasResponseSchema = z.object({
  items: z.array(
    z.object({
      id_proveedor: z.string(),
      tipo: z.string(),
      ciudad: z.string().nullable().optional(),
      total_siniestros_sospechosos: z.number(),
      casos_rojos: z.number(),
      casos_amarillos: z.number(),
      monto_total: z.number(),
      score_promedio: z.number(),
      en_lista_restrictiva: z.boolean(),
    })
  ),
  total_devuelto: z.number(),
});
