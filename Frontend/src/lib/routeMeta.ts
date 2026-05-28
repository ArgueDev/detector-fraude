export type RouteMeta = {
  title: string;
  subtitle: string;
};

export const routeMetaMap: Record<string, RouteMeta> = {
  "/": {
    title: "Dashboard Antifraude",
    subtitle: "Monitoreo inteligente de siniestros y riesgos",
  },
  "/dashboard": {
    title: "Dashboard Antifraude",
    subtitle: "Monitoreo inteligente de siniestros y riesgos",
  },
  "/casos": {
    title: "Casos Críticos",
    subtitle: "Panel de investigación y priorización de siniestros",
  },
  "/ia": {
    title: "AI Assistant",
    subtitle: "Asistente inteligente para análisis antifraude",
  },
  "/reportes": {
    title: "Reportes",
    subtitle: "Informes ejecutivos y exportación de métricas",
  },
};

export function getRouteMeta(pathname: string): RouteMeta {
  return routeMetaMap[pathname] ?? routeMetaMap["/"];
}
