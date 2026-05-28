from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
import json

from ...core.database import get_db
from ...model.siniestro import Siniestro
from ...model.poliza import Poliza
from ...model.asegurado import Asegurado
from ...core.fraud_rules import evaluar_reglas, guardar_resultado_reglas
from ...core.fraud_predictor import predecir_fraude, calcular_score_final

router = APIRouter(prefix="/siniestros", tags=["Siniestros"])


def _calcular_y_guardar_score(db: Session, siniestro: Siniestro) -> Siniestro:
    """Evalúa reglas + ML y persiste el score en el siniestro."""
    poliza    = db.query(Poliza).filter(Poliza.id_poliza == siniestro.id_poliza).first()
    asegurado = db.query(Asegurado).filter(Asegurado.id_asegurado == siniestro.id_asegurado).first()

    if not poliza or not asegurado:
        return siniestro

    # 1. Reglas de negocio
    resultado_reglas = evaluar_reglas(db, siniestro, poliza, asegurado)

    # 2. Modelo ML
    resultado_ml = predecir_fraude(siniestro, poliza, asegurado)

    # 3. Score final combinado
    score_final, nivel = calcular_score_final(
        resultado_reglas['score_reglas'],
        resultado_ml['score_ml']
    )

    # 4. Si hay regla crítica (Rojo/Amarillo), forzar nivel mínimo
    if resultado_reglas['nivel_critico'] == 'Rojo':
        nivel = 'Rojo'
        score_final = max(score_final, 76)
    elif resultado_reglas['nivel_critico'] == 'Amarillo' and nivel == 'Verde':
        nivel = 'Amarillo'
        score_final = max(score_final, 41)

    # 5. Persistir
    siniestro.score_riesgo      = score_final
    siniestro.nivel_riesgo      = nivel
    siniestro.alertas_activadas = json.dumps(
        resultado_reglas['alertas'], ensure_ascii=False
    )
    db.commit()
    db.refresh(siniestro)

    return siniestro


# ── Endpoints ─────────────────────────────────────────────────────────────────

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

@router.post("/recalcular-todos")
def recalcular_todos(
    db: Session = Depends(get_db)
):
    """Recalcula el score de todos los siniestros. Útil para la demo."""
    siniestros = db.query(Siniestro).all()
    resultados = {"procesados": 0, "errores": 0}

    for s in siniestros:
        try:
            _calcular_y_guardar_score(db, s)
            resultados["procesados"] += 1
        except Exception as e:
            resultados["errores"] += 1
            print(f"[ERROR] {s.id_siniestro}: {e}")

    return resultados

@router.get("/{id_siniestro}")
def detalle_siniestro(
    id_siniestro: str,
    db: Session = Depends(get_db)
):
    s = db.query(Siniestro).filter(
        Siniestro.id_siniestro == id_siniestro
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Siniestro no encontrado")
    return s


@router.post("/{id_siniestro}/calcular-score")
def calcular_score(
    id_siniestro: str,
    db: Session = Depends(get_db)
):
    """Recalcula el score de riesgo de un siniestro específico."""
    s = db.query(Siniestro).filter(
        Siniestro.id_siniestro == id_siniestro
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Siniestro no encontrado")

    s = _calcular_y_guardar_score(db, s)

    alertas = json.loads(s.alertas_activadas) if s.alertas_activadas else []

    return {
        "id_siniestro":  s.id_siniestro,
        "score_riesgo":  s.score_riesgo,
        "nivel_riesgo":  s.nivel_riesgo,
        "alertas":       alertas,
    }

