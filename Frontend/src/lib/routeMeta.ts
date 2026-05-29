import { BRAND_NAME, BRAND_TAGLINE } from "./branding";

export type RouteMeta = {
  title: string;
  subtitle: string;
};

export const routeMetaMap: Record<string, RouteMeta> = {
  "/": {
    title: "Dashboard de Riesgo",
    subtitle: `${BRAND_NAME} · ${BRAND_TAGLINE}`,
  },
  "/dashboard": {
    title: "Dashboard de Riesgo",
    subtitle: `${BRAND_NAME} · ${BRAND_TAGLINE}`,
  },
  "/analisis-riesgo": {
    title: "Análisis de Riesgo",
    subtitle: `${BRAND_NAME} · Indicadores y métricas de riesgo`,
  },
  "/casos": {
    title: "Casos Críticos",
    subtitle: `${BRAND_NAME} · Panel de investigación y priorización`,
  },
  "/casos-criticos": {
    title: "Casos Críticos",
    subtitle: `${BRAND_NAME} · Vista de detalle de casos críticos`,
  },
  "/ia": {
    title: "ARIA Assistant",
    subtitle: "Agente conversacional de análisis antifraude",
  },
  "/reportes": {
    title: "Reportes",
    subtitle: `${BRAND_NAME} · Informes ejecutivos y exportación`,
  },
};

export function getRouteMeta(pathname: string): RouteMeta {
  return routeMetaMap[pathname] ?? routeMetaMap["/"];
}
