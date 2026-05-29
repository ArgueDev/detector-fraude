import type { ZodSchema } from "zod";

export function parseApiResponse<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error("[API] Validación fallida:", result.error.flatten());
    throw new Error("Respuesta inválida del servidor");
  }

  return result.data;
}
