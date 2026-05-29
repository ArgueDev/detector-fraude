"""
Endpoints de siniestros: listado, detalle, cálculo de score y explicación IA.

Flujo de cálculo por siniestro
──────────────────────────────
  1. Reglas de negocio  → score_reglas (0-100) + alertas + nivel_critico
  2. Modelo ML          → score_ml (0.0-1.0)
  3. Score final        → 60 % reglas + 40 % ML  →  Verde / Amarillo / Rojo
  4. Override crítico   → si hay RF-01/RF-02/RF-03 fuerza nivel mínimo Rojo (≥76)
                          si hay RF-05/RF-06/RF-07 fuerza nivel mínimo Amarillo (≥41)
  5. (Opcional) Gemini  → explicación ejecutiva en lenguaje natural

PRINCIPIO CLAVE: los resultados son alertas de revisión, no acusaciones.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional

from ...core.database import get_db
from ...model.siniestro import Siniestro
from ...model.poliza import Poliza
from ...model.asegurado import Asegurado
from ...core.fraud_rules import evaluar_reglas
from ...core.fraud_predictor import predecir_fraude, calcular_score_final
from ...explainability.explain_score import explainer
from ...schemas.siniestro import serializar_siniestro

router = APIRouter(prefix="/siniestros", tags=["Siniestros"])


# ── Lógica de negocio central ─────────────────────────────────────────────────

def _calcular_y_guardar_score(db: Session, siniestro: Siniestro) -> dict:
    """
    Evalúa reglas + ML, persiste el score en el siniestro y devuelve
    un dict con los scores intermedios necesarios para explain_score.

    Retorna
    -------
    {
        "siniestro":    Siniestro  — objeto ORM ya actualizado y commitado,
        "score_reglas": int        — score del motor de reglas (0-100),
        "score_ml":     float      — probabilidad ML (0.0-1.0),
    }
    Si no existen póliza o asegurado retorna scores en 0 sin modificar el siniestro.
    """
    poliza    = db.query(Poliza).filter(Poliza.id_poliza == siniestro.id_poliza).first()
    asegurado = db.query(Asegurado).filter(Asegurado.id_asegurado == siniestro.id_asegurado).first()

    if not poliza or not asegurado:
        return {"siniestro": siniestro, "score_reglas": 0, "score_ml": 0.0}

    # 1. Reglas de negocio
    resultado_reglas = evaluar_reglas(db, siniestro, poliza, asegurado)

    # 2. Modelo ML
    resultado_ml = predecir_fraude(siniestro, poliza, asegurado)

    # 3. Score final combinado (60 % reglas + 40 % ML)
    score_final, nivel = calcular_score_final(
        resultado_reglas['score_reglas'],
        resultado_ml['score_ml'],
    )

    # 4. Override por regla crítica: garantiza nivel mínimo
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

    return {
        "siniestro":    siniestro,
        "score_reglas": resultado_reglas['score_reglas'],
        "score_ml":     resultado_ml['score_ml'],
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", summary="Listar siniestros con filtros opcionales")
def listar_siniestros(
    nivel_riesgo: Optional[str] = Query(None, description="Verde | Amarillo | Rojo"),
    ramo:         Optional[str] = Query(None, description="Vehículos | Salud | Vida | Hogar | Generales"),
    limit:        int           = Query(50, le=200),
    offset:       int           = Query(0, ge=0),
    db:           Session       = Depends(get_db),
):
    q = db.query(Siniestro)
    if nivel_riesgo:
        q = q.filter(Siniestro.nivel_riesgo == nivel_riesgo)
    if ramo:
        q = q.filter(Siniestro.ramo == ramo)
    q     = q.order_by(desc(Siniestro.score_riesgo))
    total = q.count()
    items = q.offset(offset).limit(limit).all()
    return {"total": total, "items": [serializar_siniestro(s) for s in items]}


@router.get("/ranking", summary="Top N siniestros ordenados por score de riesgo")
def ranking_riesgo(
    limit: int     = Query(10, ge=1, le=50),
    db:    Session = Depends(get_db),
):
    items = (
        db.query(Siniestro)
        .order_by(desc(Siniestro.score_riesgo))
        .limit(limit)
        .all()
    )
    return {"items": [serializar_siniestro(s) for s in items]}


@router.post(
    "/recalcular-todos",
    summary="Recalcula el score de todos los siniestros (útil para la demo)",
)
def recalcular_todos(db: Session = Depends(get_db)):
    """
    Procesa toda la base de datos en un solo request.
    Devuelve cuántos siniestros se procesaron y cuántos fallaron.
    """
    siniestros = db.query(Siniestro).all()
    resultados = {"procesados": 0, "errores": 0}

    for s in siniestros:
        try:
            _calcular_y_guardar_score(db, s)
            resultados["procesados"] += 1
        except Exception as e:
            resultados["errores"] += 1
            print(f"[ERROR] recalcular-todos — {s.id_siniestro}: {e}")

    return resultados


@router.get("/{id_siniestro}", summary="Detalle completo de un siniestro")
def detalle_siniestro(
    id_siniestro: str,
    db:           Session = Depends(get_db),
):
    s = db.query(Siniestro).filter(
        Siniestro.id_siniestro == id_siniestro
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Siniestro no encontrado")
    return serializar_siniestro(s)


@router.post(
    "/{id_siniestro}/calcular-score",
    summary="Recalcula el score de un siniestro y, opcionalmente, genera explicación IA",
)
def calcular_score(
    id_siniestro:    str,
    con_explicacion: bool    = Query(
        False,
        description=(
            "Si True, llama a Gemini para generar un informe ejecutivo "
            "en lenguaje natural explicando el nivel de riesgo asignado."
        ),
    ),
    db:              Session = Depends(get_db),
):
    """
    Flujo completo por siniestro:
      - Recalcula reglas + ML.
      - Persiste score y alertas.
      - Si con_explicacion=True genera el informe IA (Gemini).
        En caso de fallo de Gemini devuelve el fallback determinístico.

    La clave `explicacion` siempre está presente en la respuesta;
    su valor es `null` cuando con_explicacion=False.
    """
    s = db.query(Siniestro).filter(
        Siniestro.id_siniestro == id_siniestro
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Siniestro no encontrado")

    resultado  = _calcular_y_guardar_score(db, s)
    siniestro  = resultado["siniestro"]
    alertas    = (
        json.loads(siniestro.alertas_activadas)
        if siniestro.alertas_activadas
        else []
    )

    respuesta = {
        "id_siniestro": siniestro.id_siniestro,
        "score_riesgo": siniestro.score_riesgo,
        "nivel_riesgo": siniestro.nivel_riesgo,
        "score_reglas": resultado["score_reglas"],
        "score_ml":     round(resultado["score_ml"], 4),
        "alertas":      alertas,
        "explicacion":  None,
    }

    if con_explicacion:
        respuesta["explicacion"] = explainer.explain_case(
            siniestro         = siniestro,
            score_reglas      = resultado["score_reglas"],
            score_ml          = resultado["score_ml"],
            alertas_activadas = alertas,
            nivel_riesgo      = siniestro.nivel_riesgo,
        )

    return respuesta