import { z } from "zod";
import { siniestroSchema } from "./siniestro.schema";

export const rankingResponseSchema = z.object({
  items: z.array(siniestroSchema),
});
