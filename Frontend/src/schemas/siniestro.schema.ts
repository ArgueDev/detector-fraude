import { z } from "zod";
import { alertasActivadasSchema } from "./alertas.schema";

export const nivelRiesgoSchema = z.enum(["Rojo", "Amarillo", "Verde"]);

const nullishNumber = z.preprocess(
  (v) => (v === null || v === undefined || v === "" ? 0 : v),
  z.coerce.number()
);

const nullishString = z.preprocess(
  (v) => (v === null || v === undefined ? "" : String(v)),
  z.string()
);

const nullishBool = z.preprocess(
  (v) => v === true || v === "true" || v === 1 || v === "1",
  z.boolean()
);

export const siniestroSchema = z.object({
  id: z.coerce.number(),
  id_poliza: nullishString,
  monto_estimado: nullishNumber,
  dias_desde_fin_poliza: nullishNumber,
  etiqueta_fraude_simulada: nullishNumber,
  monto_pagado: nullishNumber,
  dias_entre_ocurrencia_reporte: nullishNumber,
  tipo_fraude_simulado: nullishString,
  estado: nullishString,
  historial_siniestros_asegurado: nullishNumber,
  id_asegurado: nullishString,
  cobertura: nullishString,
  sucursal: nullishString,
  score_riesgo: nullishNumber,
  ramo: nullishString,
  fecha_ocurrencia: nullishString,
  descripcion: nullishString,
  fecha_reporte: nullishString,
  documentos_completos: nullishBool,
  nivel_riesgo: z.preprocess(
    (v) => (v === null || v === undefined || v === "" ? "Verde" : v),
    nivelRiesgoSchema
  ),
  id_siniestro: z.preprocess(
    (v) => (v === null || v === undefined ? "" : String(v)),
    z.string().min(1)
  ),
  beneficiario: nullishString,
  monto_reclamado: nullishNumber,
  dias_desde_inicio_poliza: nullishNumber,
  alertas_activadas: alertasActivadasSchema,
});
