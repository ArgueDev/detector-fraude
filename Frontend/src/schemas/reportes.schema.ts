import { z } from "zod";
import { estadisticasSchema } from "./estadisticas.schema";

export const reportesResumenSchema = estadisticasSchema.extend({
  tasa_deteccion: z.number().optional(),
});
