"""
context_builder.py — Construcción del contexto para el agente antifraude.

Dos modos:
  - build_context_global()    → llama a todos los endpoints de estadísticas
                                y arma un texto estructurado con los datos
                                necesarios para responder las 12 preguntas
                                del PDF (sección 12).
  - build_context_siniestro() → detalle completo de un siniestro específico.

Este módulo NO sabe nada de Gemini ni de historial conversacional.
Solo obtiene datos y los formatea como texto.
"""

import os
import httpx

from .ia_prompts import TEMPLATE_CONTEXTO_GLOBAL, TEMPLATE_CONTEXTO_SINIESTRO

_BASE_URL = os.getenv("INTERNAL_API_URL", "http://localhost:8000")
_TIMEOUT  = 10.0


# ── HTTP helper ───────────────────────────────────────────────────────────────

def _get(endpoint: str, params: dict = None) -> dict | None:
    """GET interno con manejo de errores silencioso."""
    try:
        resp = httpx.get(
            f"{_BASE_URL}{endpoint}",
            params=params or {},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[context_builder] Error en {endpoint}: {e}")
        return None


# ── Secciones individuales ────────────────────────────────────────────────────

def _seccion_resumen(data: dict) -> str:
    """Resumen general + top siniestros críticos."""
    if not data:
        return ""
    r   = data.get("resumen", {})
    top = data.get("top_siniestros_criticos", [])

    lineas_top = "\n".join(
        f"  {i+1}. {s['id_siniestro']} | Score: {s['score_riesgo']} | "
        f"{s['ramo']} | ${s.get('monto_reclamado', 0):,.2f} | {s['nivel_riesgo']}"
        for i, s in enumerate(top)
    )

    ramo_critico = data.get("ramo_mas_critico", {})

    return (
        f"## RESUMEN GENERAL\n"
        f"- Total siniestros analizados : {r.get('total_siniestros', 'N/D')}\n"
        f"- Casos ROJOS (críticos)      : {r.get('casos_criticos_rojos', 'N/D')}\n"
        f"- Casos AMARILLOS (revisión)  : {r.get('casos_revision_amarillos', 'N/D')}\n"
        f"- Porcentaje en riesgo        : {r.get('porcentaje_en_riesgo', 'N/D')}%\n"
        f"- Monto total reclamado       : ${r.get('monto_total_reclamado', 0):,.2f}\n"
        f"- Monto en casos sospechosos  : ${r.get('monto_en_riesgo', 0):,.2f} "
        f"({r.get('porcentaje_monto_riesgo', 0)}%)\n"
        f"- Ramo más crítico            : {ramo_critico.get('ramo', 'N/D')} "
        f"({ramo_critico.get('casos_rojos', 0)} casos rojos)\n\n"
        f"## TOP SINIESTROS CRÍTICOS\n"
        f"{lineas_top or '  Sin datos'}"
    )


def _seccion_proveedores(data: dict) -> str:
    """Ranking de proveedores con más alertas."""
    if not data:
        return ""
    items = data.get("items", [])
    if not items:
        return ""
    lineas = [
        f"  - {p['id_proveedor']} ({p['tipo']}, {p.get('ciudad', '?')}): "
        f"{p['total_siniestros_sospechosos']} sospechosos | "
        f"{p['casos_rojos']} rojos | ${p['monto_total']:,.2f}"
        + (" ⚠️ LISTA RESTRICTIVA" if p.get("en_lista_restrictiva") else "")
        for p in items
    ]
    return "## PROVEEDORES CON MÁS ALERTAS\n" + "\n".join(lineas)


def _seccion_ramos(data: dict) -> str:
    """Ramos ordenados por porcentaje de casos sospechosos."""
    if not data:
        return ""
    items = data.get("items", [])[:6]
    if not items:
        return ""
    lineas = [
        f"  - {r['ramo']}: {r['porcentaje_sospechoso']}% sospechosos "
        f"({r['casos_rojos']} rojos, {r['casos_amarillos']} amarillos) | "
        f"${r['monto_total']:,.2f}"
        for r in items
    ]
    return "## RAMOS POR % SOSPECHOSOS\n" + "\n".join(lineas)


def _seccion_ciudades(data: dict) -> str:
    """Ciudades/sucursales con mayor concentración de alertas."""
    if not data:
        return ""
    items = data.get("items", [])
    if not items:
        return ""
    lineas = [
        f"  - {c['ciudad']}: {c['total_alertas']} alertas "
        f"({c['casos_rojos']} rojos) | ${c['monto_total']:,.2f}"
        for c in items
    ]
    return "## CIUDADES CON MÁS ALERTAS\n" + "\n".join(lineas)


def _seccion_asegurados(data: dict) -> str:
    """Asegurados con mayor frecuencia de siniestros sospechosos."""
    if not data:
        return ""
    items = data.get("items", [])
    if not items:
        return ""
    lineas = [
        f"  - {a['id_asegurado']} ({a.get('segmento', '?')}, {a.get('ciudad', '?')}): "
        f"{a['total_siniestros_sospechosos']} sospechosos | "
        f"{a['casos_rojos']} rojos | ${a['monto_total']:,.2f} | "
        f"score cliente: {a.get('score_cliente', 'N/D')}"
        for a in items
    ]
    return "## ASEGURADOS CON MAYOR FRECUENCIA\n" + "\n".join(lineas)


def _seccion_montos_atipicos(data: dict) -> str:
    """Casos con montos reclamados atípicamente altos."""
    if not data:
        return ""
    items = data.get("items", [])[:8]
    if not items:
        return ""
    lineas = [
        f"  - {m['id_siniestro']} ({m['ramo']}): "
        f"${m['monto_reclamado']:,.2f} reclamado | "
        f"{m['ratio_vs_suma']}% de la suma asegurada | "
        f"nivel: {m.get('nivel_riesgo', 'N/D')}"
        for m in items
    ]
    return "## CASOS CON MONTOS ATÍPICOS\n" + "\n".join(lineas)


def _seccion_borde_vigencia(data: dict) -> str:
    """Siniestros cercanos al borde de vigencia de la póliza."""
    if not data:
        return ""
    items = data.get("items", [])[:8]
    if not items:
        return ""
    lineas = [
        f"  - {s['id_siniestro']} ({s['ramo']}): "
        f"borde mínimo {s['borde_minimo_dias']} días | "
        f"inicio: {s.get('dias_desde_inicio_poliza', 'N/D')} días | "
        f"fin: {s.get('dias_desde_fin_poliza', 'N/D')} días | "
        f"nivel: {s.get('nivel_riesgo', 'N/D')}"
        for s in items
    ]
    return "## SINIESTROS CERCA DEL BORDE DE VIGENCIA\n" + "\n".join(lineas)


def _seccion_documentos(data: dict) -> str:
    """Documentos faltantes o con inconsistencias en casos críticos."""
    if not data:
        return ""
    casos    = data.get("casos_con_problemas_documentales", 0)
    por_tipo = data.get("por_tipo_documento", [])[:6]
    if not por_tipo:
        return ""
    lineas = [
        f"  - {d['tipo_documento']}: "
        f"{d['con_inconsistencias']} inconsistencias | "
        f"{d['no_entregados']} no entregados | "
        f"{d['ilegibles']} ilegibles"
        for d in por_tipo
    ]
    return (
        f"## DOCUMENTOS FALTANTES O INCONSISTENTES\n"
        f"  Casos con problemas documentales: {casos}\n"
        + "\n".join(lineas)
    )


def _seccion_patrones(data: dict) -> str:
    """Patrones de alerta más frecuentes en casos sospechosos."""
    if not data:
        return ""
    items = data.get("patrones", [])[:8]
    if not items:
        return ""
    lineas = [
        f"  - {p['patron']}: {p['frecuencia']} veces ({p['porcentaje']}%)"
        for p in items
    ]
    return (
        f"## PATRONES MÁS FRECUENTES "
        f"(sobre {data.get('total_casos_analizados', '?')} casos)\n"
        + "\n".join(lineas)
    )


# ── Constructores públicos ────────────────────────────────────────────────────

def build_context_global() -> str:
    """
    Llama a todos los endpoints de estadísticas en paralelo y construye
    el contexto completo para responder las 12 preguntas del PDF (sección 12).

    Cubre:
      - Top 10 siniestros de mayor riesgo         (pregunta 1)
      - Proveedores con más alertas               (pregunta 2)
      - Ramos con más casos sospechosos           (pregunta 3)
      - Ciudades con mayor concentración          (pregunta 4)
      - Asegurados con mayor frecuencia           (pregunta 5)
      - Documentos faltantes en casos críticos    (pregunta 6)
      - Casos con montos atípicos                 (pregunta 7)
      - Siniestros cerca del borde de vigencia    (pregunta 8)
      - Patrones repetidos en reclamos            (pregunta 9)
      - Resumen ejecutivo                         (preguntas 10 y 11)
    """
    # Todas las llamadas HTTP
    resumen     = _get("/api/v1/estadisticas/resumen-ejecutivo", {"top_n": 10})
    proveedores = _get("/api/v1/estadisticas/proveedores-alertas", {"limit": 10})
    ramos       = _get("/api/v1/estadisticas/ramos-sospechosos")
    ciudades    = _get("/api/v1/estadisticas/ciudades-alertas", {"limit": 10})
    asegurados  = _get("/api/v1/estadisticas/asegurados-frecuentes", {"limit": 10})
    montos      = _get("/api/v1/estadisticas/montos-atipicos", {"limit": 10})
    borde       = _get("/api/v1/estadisticas/borde-vigencia", {"dias_umbral": 30})
    documentos  = _get("/api/v1/estadisticas/documentos-faltantes")
    patrones    = _get("/api/v1/estadisticas/patrones-repetidos")

    # Armar secciones (omite las que no tienen datos)
    secciones = list(filter(None, [
        _seccion_resumen(resumen),
        _seccion_proveedores(proveedores),
        _seccion_ramos(ramos),
        _seccion_ciudades(ciudades),
        _seccion_asegurados(asegurados),
        _seccion_montos_atipicos(montos),
        _seccion_borde_vigencia(borde),
        _seccion_documentos(documentos),
        _seccion_patrones(patrones),
    ]))

    if not secciones:
        return (
            "Sin datos disponibles en el sistema. "
            "Ejecuta POST /api/v1/siniestros/recalcular-todos primero."
        )

    contenido = "\n\n".join(secciones)
    return TEMPLATE_CONTEXTO_GLOBAL.format(secciones=contenido)


def build_context_siniestro(id_siniestro: str) -> str:
    """
    Detalle completo de un siniestro específico para responder:
    '¿Por qué este siniestro fue marcado como alto riesgo?' (pregunta 12)
    """
    datos = _get(f"/api/v1/siniestros/{id_siniestro}")
    if not datos:
        return f"No se encontró información para el siniestro {id_siniestro}."

    alertas = datos.get("alertas_activadas") or []
    if isinstance(alertas, str):
        import json
        try:
            alertas = json.loads(alertas)
        except Exception:
            alertas = []

    alertas_str = (
        "\n".join(f"  • {a}" for a in alertas)
        if alertas else "  • Ninguna alerta activada"
    )

    detalle = (
        f"- Ramo             : {datos.get('ramo', 'N/D')}\n"
        f"- Cobertura        : {datos.get('cobertura', 'N/D')}\n"
        f"- Estado           : {datos.get('estado', 'N/D')}\n"
        f"- Score de riesgo  : {datos.get('score_riesgo', 'N/D')} / 100\n"
        f"- Nivel de riesgo  : {datos.get('nivel_riesgo', 'N/D')}\n"
        f"- Monto reclamado  : ${datos.get('monto_reclamado') or 0:,.2f}\n"
        f"- Monto estimado   : ${datos.get('monto_estimado') or 0:,.2f}\n"
        f"- Beneficiario     : {datos.get('beneficiario', 'N/D')}\n"
        f"- Sucursal         : {datos.get('sucursal', 'N/D')}\n"
        f"- Días inicio póliza   : {datos.get('dias_desde_inicio_poliza', 'N/D')}\n"
        f"- Días fin póliza      : {datos.get('dias_desde_fin_poliza', 'N/D')}\n"
        f"- Días ocurr→reporte   : {datos.get('dias_entre_ocurrencia_reporte', 'N/D')}\n"
        f"- Documentos completos : {'Sí' if datos.get('documentos_completos') else 'No'}\n"
        f"- Historial siniestros : {datos.get('historial_siniestros_asegurado', 'N/D')}\n"
        f"\n### ALERTAS ACTIVADAS\n{alertas_str}\n"
        f"\n### DESCRIPCIÓN\n{datos.get('descripcion', 'Sin descripción.')}"
    )

    return TEMPLATE_CONTEXTO_SINIESTRO.format(
        id_siniestro=id_siniestro,
        detalle=detalle,
    )