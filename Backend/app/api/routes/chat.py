from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ...core.database import get_db

router = APIRouter(prefix="/chat", tags=["Chat"])

class PreguntaChat(BaseModel):
    pregunta: str
    id_siniestro: str | None = None

@router.post("/")
def chat(payload: PreguntaChat, db: Session = Depends(get_db)):
    # Steven conecta aquí su agente
    return {
        "pregunta": payload.pregunta,
        "respuesta": "Agente pendiente de integración (Steven)",
        "id_siniestro": payload.id_siniestro
    }