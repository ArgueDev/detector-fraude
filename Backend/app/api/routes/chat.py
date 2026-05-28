"""
chat.py — Endpoints HTTP del agente antifraude.

Solo responsabilidad: recibir requests HTTP y delegar al ClaimsAgent.
Toda la lógica de contexto, historial y Gemini vive en ai_agent/.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from ...ai_agent.claims_agent import agent

router = APIRouter(prefix="/chat", tags=["Chat"])


class PreguntaChat(BaseModel):
    pregunta:     str
    id_siniestro: str | None = None

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "summary": "Consulta global",
                    "value": {
                        "pregunta": "¿Cuáles son los 10 siniestros con mayor riesgo?"
                    },
                },
                {
                    "summary": "Caso específico",
                    "value": {
                        "pregunta":      "¿Por qué este caso tiene nivel rojo?",
                        "id_siniestro":  "SIN-00042",
                    },
                },
            ]
        }


@router.post("/", summary="Consulta en lenguaje natural al agente antifraude")
def chat(payload: PreguntaChat):
    """
    Envía una pregunta al agente. El agente detecta automáticamente
    si la pregunta menciona un siniestro específico (ej. SIN-00042)
    y selecciona el contexto adecuado.

    Mantiene memoria de los últimos 10 turnos de la conversación.
    """
    respuesta = agent.ask(
        pregunta     = payload.pregunta,
        id_siniestro = payload.id_siniestro,
    )
    return {
        "pregunta":       payload.pregunta,
        "respuesta":      respuesta,
        "id_siniestro":   payload.id_siniestro,
        "turnos_memoria": agent.turnos_en_memoria,
    }


@router.post("/limpiar", summary="Reinicia el historial conversacional")
def limpiar_historial():
    """
    Borra el historial de la sesión actual.
    Llamar entre sesiones de analistas distintos para evitar
    que el contexto de un analista contamine al siguiente.
    """
    agent.limpiar_historial()
    return {"mensaje": "Historial reiniciado.", "turnos_memoria": 0}


@router.get("/historial", summary="Ver historial resumido (debug)")
def ver_historial():
    return {
        "turnos":    agent.turnos_en_memoria,
        "mensajes":  agent.resumen_historial(),
    }