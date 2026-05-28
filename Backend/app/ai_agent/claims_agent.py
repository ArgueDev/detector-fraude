"""
claims_agent.py — Agente de IA para consultas en lenguaje natural.
Usa Gemini (google-genai) + endpoints de estadísticas.
"""

import os
import re
import json
import httpx
from google import genai
from google.genai import types

# ── SYSTEM PROMPT — debe definirse ANTES del cliente ─────────────────────────
_SYSTEM_PROMPT = """Eres un asistente especializado en análisis antifraude para una aseguradora.
Tu función es ayudar a los analistas a revisar siniestros sospechosos.

REGLAS ESTRICTAS:
1. Nunca acuses a un asegurado, proveedor o beneficiario de cometer fraude.
2. Siempre usa lenguaje como "posible anomalía", "requiere revisión", "señal de alerta".
3. Basa TODAS tus respuestas en los datos reales que se te proporcionan.
4. Si los datos no son suficientes para responder, dilo claramente.
5. Sé conciso: el analista necesita respuestas accionables, no párrafos largos.
6. Cuando listes siniestros o proveedores, usa formato estructurado.

Recuerda: tu output es una herramienta de apoyo a la decisión humana, no una decisión automatizada."""

# ── Cliente Gemini ────────────────────────────────────────────────────────────
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
_BASE_URL = os.getenv("INTERNAL_API_URL", "http://localhost:8000")


# ── Helpers internos ──────────────────────────────────────────────────────────

def _get(endpoint: str, params: dict = None) -> dict | None:
    try:
        resp = httpx.get(f"{_BASE_URL}{endpoint}", params=params or {}, timeout=10.0)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[claims_agent] Error en {endpoint}: {e}")
        return None


def _detectar_id_siniestro(pregunta: str) -> str | None:
    match = re.search(r'\b(SIN[-]?\d+)\b', pregunta, re.IGNORECASE)
    if match:
        raw = match.group(1).upper()
        # Normaliza SIN0001 → SIN-0001
        return re.sub(r'^SIN(\d+)$', r'SIN-\1', raw)
    return None


def _obtener_contexto_global() -> str:
    resumen     = _get("/estadisticas/resumen-ejecutivo", {"top_n": 5})
    proveedores = _get("/estadisticas/proveedores-alertas", {"limit": 5})
    ramos       = _get("/estadisticas/ramos-sospechosos")
    ciudades    = _get("/estadisticas/ciudades-alertas", {"limit": 5})
    patrones    = _get("/estadisticas/patrones-repetidos")

    secciones = []

    if resumen:
        r = resumen.get("resumen", {})
        secciones.append(
            f"## RESUMEN GENERAL\n"
            f"- Total siniestros: {r.get('total_siniestros', 'N/D')}\n"
            f"- Casos ROJOS: {r.get('casos_criticos_rojos', 'N/D')}\n"
            f"- Casos AMARILLOS: {r.get('casos_revision_amarillos', 'N/D')}\n"
            f"- % en riesgo: {r.get('porcentaje_en_riesgo', 'N/D')}%\n"
            f"- Monto total reclamado: ${r.get('monto_total_reclamado', 0):,.2f}\n"
            f"- Monto en casos sospechosos: ${r.get('monto_en_riesgo', 0):,.2f} "
            f"({r.get('porcentaje_monto_riesgo', 0)}%)\n"
            f"- Score promedio general: {r.get('score_promedio_general', 'N/D')}\n"
            f"- Ramo más crítico: {resumen.get('ramo_mas_critico', {}).get('ramo', 'N/D')}"
        )

        top = resumen.get("top_siniestros_criticos", [])
        if top:
            lineas = [
                f"  {i+1}. {s['id_siniestro']} | Score: {s['score_riesgo']} | "
                f"{s['ramo']} | ${s.get('monto_reclamado', 0):,.2f}"
                for i, s in enumerate(top)
            ]
            secciones.append("## TOP SINIESTROS CRÍTICOS\n" + "\n".join(lineas))

        provs = resumen.get("proveedores_con_mas_alertas", [])
        if provs:
            lineas = [
                f"  - {p['id_proveedor']}: {p['casos_sospechosos']} casos"
                for p in provs
            ]
            secciones.append("## PROVEEDORES DESTACADOS\n" + "\n".join(lineas))

    if proveedores:
        items = proveedores.get("items", [])[:5]
        if items:
            lineas = [
                f"  - {p['id_proveedor']} ({p['tipo']}, {p.get('ciudad', '?')}): "
                f"{p['total_siniestros_sospechosos']} sospechosos | "
                f"{p['casos_rojos']} rojos | "
                f"${p['monto_total']:,.2f}"
                + (" ⚠️ LISTA RESTRICTIVA" if p.get("en_lista_restrictiva") else "")
                for p in items
            ]
            secciones.append("## RANKING PROVEEDORES\n" + "\n".join(lineas))

    if ramos:
        items = ramos.get("items", [])[:6]
        if items:
            lineas = [
                f"  - {r['ramo']}: {r['porcentaje_sospechoso']}% sospechosos "
                f"({r['casos_rojos']} rojos, {r['casos_amarillos']} amarillos)"
                for r in items
            ]
            secciones.append("## RAMOS POR % SOSPECHOSOS\n" + "\n".join(lineas))

    if ciudades:
        items = ciudades.get("items", [])[:5]
        if items:
            lineas = [
                f"  - {c['ciudad']}: {c['total_alertas']} alertas "
                f"({c['casos_rojos']} rojos)"
                for c in items
            ]
            secciones.append("## CIUDADES CON MÁS ALERTAS\n" + "\n".join(lineas))

    if patrones:
        items = patrones.get("patrones", [])[:8]
        if items:
            lineas = [
                f"  - {p['patron']}: {p['frecuencia']} veces ({p['porcentaje']}%)"
                for p in items
            ]
            secciones.append("## PATRONES MÁS FRECUENTES\n" + "\n".join(lineas))

    return "\n\n".join(secciones) if secciones else (
        "Sin datos disponibles. Ejecuta POST /siniestros/recalcular-todos primero."
    )


def _obtener_contexto_siniestro(id_siniestro: str) -> str:
    # Pide detalle con explicación ya generada
    datos = _get(f"/siniestros/{id_siniestro}", {"con_explicacion": "false"})
    if not datos:
        return f"No se encontró el siniestro {id_siniestro}."

    alertas = datos.get("alertas") or []
    alertas_str = "\n".join(f"  • {a}" for a in alertas) if alertas else "  • Ninguna"

    return (
        f"## SINIESTRO {id_siniestro}\n"
        f"- Ramo: {datos.get('ramo', 'N/D')}\n"
        f"- Cobertura: {datos.get('cobertura', 'N/D')}\n"
        f"- Score: {datos.get('score_riesgo', 'N/D')} / 100\n"
        f"- Nivel: {datos.get('nivel_riesgo', 'N/D')}\n"
        f"- Monto reclamado: ${datos.get('monto_reclamado') or 0:,.2f}\n"
        f"- Monto estimado:  ${datos.get('monto_estimado') or 0:,.2f}\n"
        f"- Estado: {datos.get('estado', 'N/D')}\n"
        f"- Sucursal: {datos.get('sucursal', 'N/D')}\n"
        f"- Días desde inicio póliza: {datos.get('dias_desde_inicio_poliza', 'N/D')}\n"
        f"- Días desde fin póliza: {datos.get('dias_desde_fin_poliza', 'N/D')}\n"
        f"- Días ocurrencia→reporte: {datos.get('dias_entre_ocurrencia_reporte', 'N/D')}\n"
        f"- Documentos completos: {'Sí' if datos.get('documentos_completos') else 'No'}\n"
        f"- Beneficiario: {datos.get('beneficiario', 'N/D')}\n"
        f"- Historial siniestros: {datos.get('historial_siniestros_asegurado', 'N/D')}\n"
        f"\n## ALERTAS ACTIVADAS\n{alertas_str}\n"
        f"\n## DESCRIPCIÓN\n{datos.get('descripcion', 'Sin descripción.')}"
    )


# ── Clase principal ───────────────────────────────────────────────────────────

class ClaimsAgent:
    def __init__(self):
        self._historial: list[dict] = []

    def ask(self, pregunta: str, id_siniestro: str = None) -> str:
        # 1. Detectar contexto
        id_detectado = id_siniestro or _detectar_id_siniestro(pregunta)

        if id_detectado:
            contexto = _obtener_contexto_siniestro(id_detectado)
            tipo = f"siniestro específico ({id_detectado})"
        else:
            contexto = _obtener_contexto_global()
            tipo = "base de datos completa"

        # 2. Mensaje con contexto embebido
        mensaje = (
            f"[Consulta sobre: {tipo}]\n\n"
            f"DATOS DEL SISTEMA:\n{contexto}\n\n"
            f"PREGUNTA DEL ANALISTA:\n{pregunta}"
        )

        # 3. Añadir al historial
        self._historial.append({"role": "user", "parts": [{"text": mensaje}]})

        # 4. Llamar a Gemini con historial completo
        try:
            response = _client.models.generate_content(
                model="gemini-2.5-flash",
                config=types.GenerateContentConfig(
                    system_instruction=_SYSTEM_PROMPT,
                    max_output_tokens=1000,
                    temperature=0.3,
                ),
                contents=[
                    types.Content(role=m["role"], parts=[types.Part(text=m["parts"][0]["text"])])
                    for m in self._historial
                ],
            )
            respuesta = response.text

        except Exception as e:
            respuesta = f"Error al consultar Gemini: {e}"

        # 5. Guardar respuesta — Gemini usa "model", no "assistant"
        self._historial.append({"role": "model", "parts": [{"text": respuesta}]})

        # 6. Limitar a 10 turnos
        if len(self._historial) > 20:
            self._historial = self._historial[-20:]

        return respuesta

    def limpiar_historial(self) -> None:
        self._historial = []

    @property
    def turnos_en_memoria(self) -> int:
        return len(self._historial) // 2


# ── Instancia global ──────────────────────────────────────────────────────────
agent = ClaimsAgent()