from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ...core.database import get_db
from ...model import Siniestro

router = APIRouter(prefix="/estadisticas", tags=["Estadisticas"])

@router.get("/")
def obtener_estadisticas(db: Session = Depends(get_db)):
    total = db.query(Siniestro).count()

    rojos = db.query(Siniestro).filter(
        Siniestro.nivel_riesgo == 'Rojo'
    ).count()

    amarillos = db.query(Siniestro).filter(
        Siniestro.nivel_riesgo == 'Amarillo'
    ).count()

    verdes = db.query(Siniestro).filter(
        Siniestro.nivel_riesgo == 'Verde'
    ).count()

    monto_total = db.query(
        func.sum(Siniestro.monto_reclamado)
    ).scalar() or 0

    return {
        "total_siniestros": total,
        "por_nivel": {
            "rojo":     rojos,
            "amarillo": amarillos,
            "verde":    verdes
        },
        "monto_total_reclamado": round(float(monto_total), 2)
    }