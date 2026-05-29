import type { z } from "zod";
import type { nivelRiesgoSchema, siniestroSchema } from "../schemas/siniestro.schema";

export type NivelRiesgo = z.infer<typeof nivelRiesgoSchema>;
export type Siniestro = z.infer<typeof siniestroSchema>;

export type ParsedAlert = {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: NivelRiesgo;
  icono: string;
};
