import { z } from "zod";

export const chatRequestSchema = z.object({
  summary: z.string().min(1),
  value: z.object({
    pregunta: z.string().min(1),
  }),
});

export const chatResponseSchema = z.string();
