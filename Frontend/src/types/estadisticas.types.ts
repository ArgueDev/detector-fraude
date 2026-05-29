import type { z } from "zod";
import type { estadisticasSchema } from "../schemas/estadisticas.schema";

export type Estadisticas = z.infer<typeof estadisticasSchema>;
