import api from "../lib/axios";
import { parseApiResponse } from "../lib/parseApi";
import { rankingResponseSchema } from "../schemas/ranking.schema";
import { siniestroSchema } from "../schemas/siniestro.schema";
import type { RankingResponse } from "../types/ranking.types";
import type { Siniestro } from "../types/siniestro.types";

export async function obtenerRankingSiniestros(
  limit = 10
): Promise<RankingResponse> {
  const { data } = await api.get("/siniestros/ranking", {
    params: { limit },
  });
  return parseApiResponse(rankingResponseSchema, data);
}

export async function obtenerSiniestroPorId(
  idSiniestro: string
): Promise<Siniestro> {
  const { data } = await api.get(`/siniestros/${idSiniestro}`);
  return parseApiResponse(siniestroSchema, data);
}
