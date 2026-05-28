"""
chat.py — Endpoints HTTP del agente antifraude.

Solo responsabilidad: recibir requests HTTP y delegar al ClaimsAgent.
Toda la lógica de contexto, historial y Gemini vive en ai_agent/.
"""

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, ConfigDict, Field

from ...ai_agent.claims_agent import agent

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatValue(BaseModel):
    pregunta: str = Field(..., min_length=1)


class PreguntaChat(BaseModel):
    summary: str = Field(..., min_length=1)
    value: ChatValue

    model_config = ConfigDict(
        json_schema_extra={
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
                        "pregunta": "¿Por qué este caso tiene nivel rojo?",
                    },
                },
            ]
        }
    )


@router.post(
    "/",
    summary="Consulta en lenguaje natural al agente antifraude",
    response_class=PlainTextResponse,
)
def chat(payload: PreguntaChat) -> str:
    """
    Recibe { summary, value: { pregunta } } y devuelve la respuesta IA como texto plano.
    El agente detecta SIN-XXXXX en la pregunta para contexto de caso específico.
    """
    return agent.ask(pregunta=payload.value.pregunta)


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
        "turnos": agent.turnos_en_memoria,
        "mensajes": agent.resumen_historial(),
    }
