"""
chat.py — Endpoint de chat con el agente antifraude.

Dos modos:
  - Con id_siniestro → contexto específico del caso (ya lo tenías)
  - Sin id_siniestro → contexto global desde /estadisticas (nuevo)

Agrega memoria conversacional por sesión.
"""

import json
import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from google import genai
from google.genai import types

from ...core.config import GEMINI_API_KEY
from ...core.database import get_db
from ...model.siniestro import Siniestro
from ...model.poliza import Poliza
from ...model.asegurado import Asegurado
from ...model.documento import Documento

# ── Cliente Gemini ────────────────────────────────────────────────────────────
client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """Eres un asistente experto en análisis antifraude para una aseguradora.
Tu rol es ayudar a los analistas a priorizar y revisar siniestros sospechosos.

REGLAS:
1. Nunca acuses directamente de fraude. Usa: "presenta señales de riesgo", 
   "requiere revisión", "posible anomalía", "se recomienda investigar".
2. Basa tus respuestas ÚNICAMENTE en los datos que se te proporcionan.
3. Si los datos no alcanzan para responder, dilo claramente.
4. Sé directo y accionable: el analista necesita saber qué hacer, no leer ensayos.
5. Cuando menciones siniestros o montos, cita los IDs y números exactos de los datos."""

# ── Historial en memoria (por proceso — suficiente para la demo) ──────────────
# Para producción real se usaría Redis o sesiones persistentes
_historial: list[dict] = []

# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_estadisticas(endpoint: str, params: dict = None) -> dict | None:
    """Llama a los endpoints de estadísticas internos."""
    import os
    base = os.getenv("INTERNAL_API_URL", "http://localhost:8000")
    try:
        resp = httpx.get(f"{base}{endpoint}", params=params or {}, timeout=8.0)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[chat] Error en {endpoint}: {e}")
        return None


def build_context(db: Session, id_siniestro: str) -> str:
    """Contexto detallado de un siniestro específico (tu versión, sin cambios)."""
    siniestro = db.query(Siniestro).filter(
        Siniestro.id_siniestro == id_siniestro
    ).first()
    if not siniestro:
        return f"No se encontró información para el siniestro {id_siniestro}."

    poliza    = db.query(Poliza).filter(Poliza.id_poliza == siniestro.id_poliza).first()
    asegurado = db.query(Asegurado).filter(Asegurado.id_asegurado == siniestro.id_asegurado).first()
    documentos = db.query(Documento).filter(Documento.id_siniestro == id_siniestro).all()

    docs_info = "\n".join(
        f"  - {d.tipo_documento}: entregado={d.entregado}, "
        f"legible={d.legible}, inconsistencia={d.inconsistencia_detectada}"
        for d in documentos
    ) or "  - Sin documentos registrados"

    alertas = []
    if siniestro.alertas_activadas:
        try:
            alertas = json.loads(siniestro.alertas_activadas)
        except Exception:
            alertas = []
    alertas_str = "\n".join(f"  • {a}" for a in alertas) or "  • Ninguna"

    return f"""=== SINIESTRO {id_siniestro} ===
- Ramo: {siniestro.ramo}
- Cobertura: {siniestro.cobertura}
- Estado: {siniestro.estado}
- Fecha ocurrencia: {siniestro.fecha_ocurrencia}
- Fecha reporte: {siniestro.fecha_reporte}
- Días entre ocurrencia y reporte: {siniestro.dias_entre_ocurrencia_reporte}
- Monto reclamado: ${siniestro.monto_reclamado:,.2f}
- Monto estimado: ${siniestro.monto_estimado:,.2f}
- Monto pagado: {siniestro.monto_pagado}
- Documentos completos: {siniestro.documentos_completos}
- Beneficiario: {siniestro.beneficiario}
- Días desde inicio póliza: {siniestro.dias_desde_inicio_poliza}
- Días desde fin póliza: {siniestro.dias_desde_fin_poliza}
- Historial siniestros asegurado: {siniestro.historial_siniestros_asegurado}
- Score de riesgo: {siniestro.score_riesgo} / 100
- Nivel de riesgo: {siniestro.nivel_riesgo}
- Descripción: {siniestro.descripcion}

=== ALERTAS ACTIVADAS ===
{alertas_str}

=== PÓLIZA ===
- Ramo: {poliza.ramo if poliza else 'N/A'}
- Vigencia: {poliza.fecha_inicio if poliza else 'N/A'} → {poliza.fecha_fin if poliza else 'N/A'}
- Suma asegurada: {poliza.suma_asegurada if poliza else 'N/A'}
- Prima: {poliza.prima if poliza else 'N/A'}
- Estado: {poliza.estado_poliza if poliza else 'N/A'}

=== ASEGURADO ===
- Segmento: {asegurado.segmento if asegurado else 'N/A'}
- Antigüedad (meses): {asegurado.antiguedad if asegurado else 'N/A'}
- Reclamos últimos 12 meses: {asegurado.reclamos_ultimos_12_meses if asegurado else 'N/A'}
- Score cliente: {asegurado.score_cliente if asegurado else 'N/A'}
- Mora actual: {asegurado.mora_actual if asegurado else 'N/A'}

=== DOCUMENTOS ===
{docs_info}"""


def build_context_global() -> str:
    """
    Contexto para preguntas sin id_siniestro.
    Llama a los endpoints de estadísticas y arma un resumen estructurado.
    """
    resumen     = _get_estadisticas("/estadisticas/resumen-ejecutivo", {"top_n": 5})
    proveedores = _get_estadisticas("/estadisticas/proveedores-alertas", {"limit": 5})
    ramos       = _get_estadisticas("/estadisticas/ramos-sospechosos")
    ciudades    = _get_estadisticas("/estadisticas/ciudades-alertas", {"limit": 5})
    patrones    = _get_estadisticas("/estadisticas/patrones-repetidos")

    secciones = []

    # ── Resumen general ───────────────────────────────────────────────────────
    if resumen:
        r = resumen.get("resumen", {})
        secciones.append(f"""=== RESUMEN GENERAL ===
- Total siniestros analizados: {r.get('total_siniestros', 'N/D')}
- Casos ROJOS (críticos): {r.get('casos_criticos_rojos', 'N/D')}
- Casos AMARILLOS (revisión): {r.get('casos_revision_amarillos', 'N/D')}
- Porcentaje en riesgo: {r.get('porcentaje_en_riesgo', 'N/D')}%
- Monto total reclamado: ${r.get('monto_total_reclamado', 0):,.2f}
- Monto en casos sospechosos: ${r.get('monto_en_riesgo', 0):,.2f} ({r.get('porcentaje_monto_riesgo', 0)}%)
- Score promedio general: {r.get('score_promedio_general', 'N/D')}
- Ramo más crítico: {resumen.get('ramo_mas_critico', {}).get('ramo', 'N/D')}""")

        top = resumen.get("top_siniestros_criticos", [])
        if top:
            lineas = [
                f"  {i+1}. {s['id_siniestro']} | Score: {s['score_riesgo']} | "
                f"{s['ramo']} | ${s.get('monto_reclamado', 0):,.2f} | {s['nivel_riesgo']}"
                for i, s in enumerate(top)
            ]
            secciones.append("=== TOP SINIESTROS CRÍTICOS ===\n" + "\n".join(lineas))

    # ── Proveedores ───────────────────────────────────────────────────────────
    if proveedores:
        items = proveedores.get("items", [])
        if items:
            lineas = [
                f"  - {p['id_proveedor']} ({p['tipo']}, {p.get('ciudad','?')}): "
                f"{p['total_siniestros_sospechosos']} sospechosos | "
                f"{p['casos_rojos']} rojos | "
                f"monto ${p['monto_total']:,.2f}"
                + (" ⚠️ LISTA RESTRICTIVA" if p.get("en_lista_restrictiva") else "")
                for p in items
            ]
            secciones.append("=== PROVEEDORES CON MÁS ALERTAS ===\n" + "\n".join(lineas))

    # ── Ramos ─────────────────────────────────────────────────────────────────
    if ramos:
        items = ramos.get("items", [])[:6]
        if items:
            lineas = [
                f"  - {r['ramo']}: {r['porcentaje_sospechoso']}% sospechosos "
                f"({r['casos_rojos']} rojos, {r['casos_amarillos']} amarillos) | "
                f"monto ${r['monto_total']:,.2f}"
                for r in items
            ]
            secciones.append("=== RAMOS POR % SOSPECHOSOS ===\n" + "\n".join(lineas))

    # ── Ciudades ──────────────────────────────────────────────────────────────
    if ciudades:
        items = ciudades.get("items", [])
        if items:
            lineas = [
                f"  - {c['ciudad']}: {c['total_alertas']} alertas | "
                f"{c['casos_rojos']} rojos | monto ${c['monto_total']:,.2f}"
                for c in items
            ]
            secciones.append("=== CIUDADES CON MÁS ALERTAS ===\n" + "\n".join(lineas))

    # ── Patrones ──────────────────────────────────────────────────────────────
    if patrones:
        items = patrones.get("patrones", [])[:8]
        if items:
            lineas = [
                f"  - {p['patron']}: {p['frecuencia']} veces ({p['porcentaje']}%)"
                for p in items
            ]
            secciones.append("=== PATRONES MÁS FRECUENTES ===\n" + "\n".join(lineas))

    if not secciones:
        return "Sin datos disponibles. Ejecuta POST /siniestros/recalcular-todos primero."

    return "\n\n".join(secciones)


def call_gemini(historial: list[dict]) -> str:
    """Llama a Gemini con historial completo para mantener memoria."""
    try:
        contents = [
            types.Content(
                role=msg["role"],
                parts=[types.Part(text=msg["content"])]
            )
            for msg in historial
        ]
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                max_output_tokens=1000,
                temperature=0.3,   # bajo para respuestas consistentes y factuales
            ),
            contents=contents,
        )
        return response.text
    except Exception as e:
        return f"Error al consultar Gemini: {e}"


# ── Router ────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/chat", tags=["Chat"])


class PreguntaChat(BaseModel):
    pregunta: str
    id_siniestro: str | None = None


@router.post("/")
def chat(payload: PreguntaChat, db: Session = Depends(get_db)):
    global _historial

    # 1. Construir contexto según si hay id_siniestro o no
    if payload.id_siniestro:
        contexto = build_context(db, payload.id_siniestro)
        tipo_consulta = f"caso específico ({payload.id_siniestro})"
    else:
        contexto = build_context_global()
        tipo_consulta = "base de datos completa"

    # 2. Armar mensaje del usuario con contexto embebido
    mensaje_usuario = f"""[Consulta sobre: {tipo_consulta}]

DATOS DEL SISTEMA:
{contexto}

PREGUNTA:
{payload.pregunta}"""

    # 3. Añadir al historial y llamar a Gemini
    _historial.append({"role": "user", "content": mensaje_usuario})
    respuesta = call_gemini(_historial)
    _historial.append({"role": "model", "content": respuesta})

    # 4. Limitar historial a 10 turnos (20 mensajes) para no exceder contexto
    if len(_historial) > 20:
        _historial = _historial[-20:]

    return {
        "pregunta":        payload.pregunta,
        "respuesta":       respuesta,
        "id_siniestro":    payload.id_siniestro,
        "tipo_consulta":   tipo_consulta,
        "turnos_memoria":  len(_historial) // 2,
    }


@router.post("/limpiar")
def limpiar_historial():
    """Reinicia la conversación. Útil entre sesiones de analistas distintos."""
    global _historial
    _historial = []
    return {"mensaje": "Historial reiniciado."}


@router.get("/historial")
def ver_historial():
    """Útil para debug durante la demo."""
    return {
        "turnos": len(_historial) // 2,
        "mensajes": [
            {"rol": m["role"], "preview": m["content"][:100] + "..."}
            for m in _historial
        ],
    }