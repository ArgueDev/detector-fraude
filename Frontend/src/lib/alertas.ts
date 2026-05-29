import type { ParsedAlert } from "../types/siniestro.types";

export function parseAlertasActivadas(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string");
  }

  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return [raw];
  }

  return [];
}

export function mapAlertasToParsed(
  alertas: string[],
  nivel: "Rojo" | "Amarillo" | "Verde" = "Rojo"
): ParsedAlert[] {
  return alertas.map((titulo, index) => ({
    id: `ALT-${index + 1}`,
    titulo,
    descripcion: "Alerta detectada por el motor de riesgo ARIA",
    nivel,
    icono: "solar:danger-triangle-bold",
  }));
}
