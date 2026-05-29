import { z } from "zod";
import { parseAlertasActivadas } from "../lib/alertas";

export const alertasActivadasSchema = z.preprocess(
  (value) => parseAlertasActivadas(value),
  z.array(z.string())
);
