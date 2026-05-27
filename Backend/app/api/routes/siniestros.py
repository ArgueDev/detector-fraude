from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional

from ...core.database import get_db
from ...model import Siniestro

router = APIRouter(prefix="/siniestros", tags=["Siniestros"])

@router.get("/")
def listar_siniestros(
    nivel_riesgo: Optional[str] = None,
    ramo:         Optional[str] = None,
    limit:        int = Query(50, le=200),
    offset:       int = 0,
    db:           Session = Depends(get_db)
):
    q = db.query(Siniestro)
    if nivel_riesgo:
        q = q.filter(Siniestro.nivel_riesgo == nivel_riesgo)
    if ramo:
        q = q.filter(Siniestro.ramo == ramo)
    q = q.order_by(desc(Siniestro.score_riesgo))
    total = q.count()
    items = q.offset(offset).limit(limit).all()
    return {"total": total, "items": items}

@router.get("/ranking")
def ranking_riesgo(
    limit: int = 10,
    db:    Session = Depends(get_db)
):
    items = (db.query(Siniestro)
               .order_by(desc(Siniestro.score_riesgo))
               .limit(limit).all())
    return {"items": items}

@router.get("/{id_siniestro}")
def detalle_siniestro(
    id_siniestro: str,
    db: Session = Depends(get_db)
):
    s = db.query(Siniestro).filter(Siniestro.id_siniestro == id_siniestro).first()
    if not s:
        raise HTTPException(status_code=404, detail="Siniestro no encontrado")
    return s