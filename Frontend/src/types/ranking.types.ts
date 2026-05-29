import type { z } from "zod";
import type { rankingResponseSchema } from "../schemas/ranking.schema";

export type RankingResponse = z.infer<typeof rankingResponseSchema>;
