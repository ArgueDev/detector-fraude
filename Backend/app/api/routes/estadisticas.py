"""
estadisticas.py — Endpoints del dashboard antifraude.
IMPORTANTE: Todos los resultados son alertas de revisión,
no acusaciones de fraude.
"""

import json
import math
import re
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case

from ...core.database import get_db
from ...model.siniestro  import Siniestro
from ...model.poliza     import Poliza
from ...model.asegurado  import Asegurado
from ...model.proveedor  import Proveedor
from ...model.documento  import Documento

router = APIRouter(prefix="/estadisticas", tags=["Estadisticas"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _porcentaje(parte: int, total: int) -> float:
    return round(parte / total * 100, 1) if total > 0 else 0.0


def _safe_dias(val) -> int:
    """Convierte dias a int seguro; nan/inf/None → 9999."""
    if val is None:
        return 9999
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return 9999
        return int(f)
    except (TypeError, ValueError):
        return 9999


def _serial(val):
    """Convierte tipos no serializables a JSON seguro."""
    if val is None:
        return None
    if hasattr(val, 'isoformat'):
        return val.isoformat()
    if isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return 0.0
    return val


def _siniestro_base(s: Siniestro) -> dict:
    alertas = []
    if s.alertas_activadas:
        try:
            alertas = json.loads(s.alertas_activadas)
        except (json.JSONDecodeError, TypeError):
            alertas = []
    return {
        "id_siniestro":    s.id_siniestro,
        "ramo":            s.ramo,
        "cobertura":       s.cobertura,
        "monto_reclamado": _serial(s.monto_reclamado),
        "score_riesgo":    _serial(s.score_riesgo),
        "nivel_riesgo":    s.nivel_riesgo,
        "alertas":         alertas,
        "estado":          s.estado,
        "sucursal":        s.sucursal,
    }


def _clave_alerta(alerta: str) -> str:
    """Extrae código RF-XX si existe; si no, primeros 40 chars."""
    match = re.match(r'^(RF-\d+)', alerta)
    return match.group(1) if match else alerta[:40]


# ── 1. Resumen general ────────────────────────────────────────────────────────

@router.get("/", summary="Resumen general del dashboard")
def obtener_estadisticas(db: Session = Depends(get_db)):
    total     = db.query(Siniestro).count()
    rojos     = db.query(Siniestro).filter(Siniestro.nivel_riesgo == 'Rojo').count()
    amarillos = db.query(Siniestro).filter(Siniestro.nivel_riesgo == 'Amarillo').count()
    verdes    = db.query(Siniestro).filter(Siniestro.nivel_riesgo == 'Verde').count()
    sin_score = db.query(Siniestro).filter(Siniestro.nivel_riesgo == None).count()  # noqa: E711

    monto_total  = db.query(func.sum(Siniestro.monto_reclamado)).scalar() or 0
    monto_riesgo = (
        db.query(func.sum(Siniestro.monto_reclamado))
        .filter(Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']))
        .scalar() or 0
    )
    score_promedio = db.query(func.avg(Siniestro.score_riesgo)).scalar() or 0

    return {
        "total_siniestros": total,
        "por_nivel": {
            "rojo":      rojos,
            "amarillo":  amarillos,
            "verde":     verdes,
            "sin_score": sin_score,
        },
        "porcentajes": {
            "rojo":     _porcentaje(rojos, total),
            "amarillo": _porcentaje(amarillos, total),
            "verde":    _porcentaje(verdes, total),
        },
        "montos": {
            "total_reclamado":      round(float(monto_total), 2),
            "en_casos_sospechosos": round(float(monto_riesgo), 2),
            "porcentaje_en_riesgo": _porcentaje(int(monto_riesgo), int(monto_total)),
        },
        "score_promedio": round(float(score_promedio), 1),
    }


# ── 2. Top N siniestros de mayor riesgo ───────────────────────────────────────

@router.get("/top-riesgo", summary="Top N siniestros con mayor score de riesgo")
def top_riesgo(
    limit: int = Query(10, ge=1, le=50),
    nivel: str = Query(None, description="Rojo | Amarillo | Verde"),
    db:    Session = Depends(get_db),
):
    q = db.query(Siniestro).filter(Siniestro.score_riesgo != None)  # noqa: E711
    if nivel:
        q = q.filter(Siniestro.nivel_riesgo == nivel)
    items = q.order_by(desc(Siniestro.score_riesgo)).limit(limit).all()
    return {"items": [_siniestro_base(s) for s in items], "total_devuelto": len(items)}


# ── 3. Proveedores con más alertas ────────────────────────────────────────────

@router.get("/proveedores-alertas", summary="Proveedores con mayor concentración de alertas")
def proveedores_alertas(
    limit: int     = Query(10, ge=1, le=50),
    db:    Session = Depends(get_db),
):
    rows = (
        db.query(
            Siniestro.beneficiario,
            func.count(Siniestro.id_siniestro).label("total_siniestros"),
            func.sum(case((Siniestro.nivel_riesgo == 'Rojo', 1), else_=0)).label("casos_rojos"),
            func.sum(case((Siniestro.nivel_riesgo == 'Amarillo', 1), else_=0)).label("casos_amarillos"),
            func.sum(Siniestro.monto_reclamado).label("monto_total"),
            func.avg(Siniestro.score_riesgo).label("score_promedio"),
        )
        .filter(
            Siniestro.beneficiario != None,  # noqa: E711
            Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']),
        )
        .group_by(Siniestro.beneficiario)
        .order_by(desc("casos_rojos"), desc("total_siniestros"))
        .limit(limit)
        .all()
    )

    resultado = []
    for r in rows:
        proveedor = db.query(Proveedor).filter(
            Proveedor.id_proveedor == r.beneficiario
        ).first()
        resultado.append({
            "id_proveedor":    r.beneficiario,
            "tipo":            proveedor.tipo if proveedor else "Desconocido",
            "ciudad":          proveedor.ciudad if proveedor else None,
            "total_siniestros_sospechosos": r.total_siniestros,
            "casos_rojos":     int(r.casos_rojos or 0),
            "casos_amarillos": int(r.casos_amarillos or 0),
            "monto_total":     round(float(r.monto_total or 0), 2),
            "score_promedio":  round(float(r.score_promedio or 0), 1),
            "en_lista_restrictiva": (
                proveedor.porcentaje_casos_observados >= 50
                if proveedor and proveedor.porcentaje_casos_observados
                else False
            ),
        })
    return {"items": resultado, "total_devuelto": len(resultado)}


# ── 4. Ramos con mayor porcentaje de casos sospechosos ────────────────────────

@router.get("/ramos-sospechosos", summary="Ramos con mayor porcentaje de casos de riesgo")
def ramos_sospechosos(db: Session = Depends(get_db)):
    rows = (
        db.query(
            Siniestro.ramo,
            func.count(Siniestro.id_siniestro).label("total"),
            func.sum(case((Siniestro.nivel_riesgo == 'Rojo', 1), else_=0)).label("rojos"),
            func.sum(case((Siniestro.nivel_riesgo == 'Amarillo', 1), else_=0)).label("amarillos"),
            func.sum(Siniestro.monto_reclamado).label("monto_total"),
            func.avg(Siniestro.score_riesgo).label("score_promedio"),
        )
        .filter(Siniestro.ramo != None)  # noqa: E711
        .group_by(Siniestro.ramo)
        .all()
    )

    resultado = []
    for r in rows:
        total       = int(r.total or 0)
        rojos       = int(r.rojos or 0)
        amarillos   = int(r.amarillos or 0)
        sospechosos = rojos + amarillos
        resultado.append({
            "ramo":                  r.ramo,
            "total_siniestros":      total,
            "casos_rojos":           rojos,
            "casos_amarillos":       amarillos,
            "total_sospechosos":     sospechosos,
            "porcentaje_sospechoso": _porcentaje(sospechosos, total),
            "monto_total":           round(float(r.monto_total or 0), 2),
            "score_promedio":        round(float(r.score_promedio or 0), 1),
        })

    resultado.sort(key=lambda x: x["porcentaje_sospechoso"], reverse=True)
    return {"items": resultado}


# ── 5. Ciudades con mayor concentración de alertas ────────────────────────────

@router.get("/ciudades-alertas", summary="Ciudades con mayor concentración de alertas")
def ciudades_alertas(
    limit: int     = Query(10, ge=1, le=50),
    db:    Session = Depends(get_db),
):
    rows = (
        db.query(
            Siniestro.sucursal,
            func.count(Siniestro.id_siniestro).label("total"),
            func.sum(case((Siniestro.nivel_riesgo == 'Rojo', 1), else_=0)).label("rojos"),
            func.sum(case((Siniestro.nivel_riesgo == 'Amarillo', 1), else_=0)).label("amarillos"),
            func.sum(Siniestro.monto_reclamado).label("monto_total"),
        )
        .filter(
            Siniestro.sucursal != None,  # noqa: E711
            Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']),
        )
        .group_by(Siniestro.sucursal)
        .order_by(desc("rojos"), desc("amarillos"))
        .limit(limit)
        .all()
    )
    return {
        "items": [
            {
                "ciudad":          r.sucursal,
                "total_alertas":   int(r.total or 0),
                "casos_rojos":     int(r.rojos or 0),
                "casos_amarillos": int(r.amarillos or 0),
                "monto_total":     round(float(r.monto_total or 0), 2),
            }
            for r in rows
        ]
    }


# ── 6. Asegurados con mayor frecuencia de reclamos ────────────────────────────

@router.get("/asegurados-frecuentes", summary="Asegurados con mayor frecuencia de reclamos sospechosos")
def asegurados_frecuentes(
    limit: int     = Query(10, ge=1, le=50),
    db:    Session = Depends(get_db),
):
    rows = (
        db.query(
            Siniestro.id_asegurado,
            func.count(Siniestro.id_siniestro).label("total_siniestros"),
            func.sum(case((Siniestro.nivel_riesgo == 'Rojo', 1), else_=0)).label("rojos"),
            func.sum(case((Siniestro.nivel_riesgo == 'Amarillo', 1), else_=0)).label("amarillos"),
            func.sum(Siniestro.monto_reclamado).label("monto_total"),
            func.avg(Siniestro.score_riesgo).label("score_promedio"),
        )
        .filter(
            Siniestro.id_asegurado != None,  # noqa: E711
            Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']),
        )
        .group_by(Siniestro.id_asegurado)
        .order_by(desc("total_siniestros"))
        .limit(limit)
        .all()
    )

    resultado = []
    for r in rows:
        asegurado = db.query(Asegurado).filter(
            Asegurado.id_asegurado == r.id_asegurado
        ).first()
        resultado.append({
            "id_asegurado":    r.id_asegurado,
            "segmento":        asegurado.segmento if asegurado else None,
            "ciudad":          asegurado.ciudad if asegurado else None,
            "antiguedad":      asegurado.antiguedad if asegurado else None,
            "score_cliente":   asegurado.score_cliente if asegurado else None,
            "mora_actual":     asegurado.mora_actual if asegurado else None,
            "total_siniestros_sospechosos": int(r.total_siniestros or 0),
            "casos_rojos":     int(r.rojos or 0),
            "casos_amarillos": int(r.amarillos or 0),
            "monto_total":     round(float(r.monto_total or 0), 2),
            "score_promedio":  round(float(r.score_promedio or 0), 1),
        })
    return {"items": resultado, "total_devuelto": len(resultado)}


# ── 7. Casos con montos atípicos ──────────────────────────────────────────────

@router.get("/montos-atipicos", summary="Siniestros con montos reclamados atípicamente altos")
def montos_atipicos(
    umbral_ratio: float = Query(0.85, description="Ratio monto/suma_asegurada mínimo"),
    limit:        int   = Query(20, ge=1, le=100),
    db:           Session = Depends(get_db),
):
    rows = (
        db.query(Siniestro, Poliza)
        .join(Poliza, Siniestro.id_poliza == Poliza.id_poliza)
        .filter(
            Poliza.suma_asegurada > 0,
            Siniestro.monto_reclamado != None,  # noqa: E711
        )
        .all()
    )

    resultado = []
    for s, p in rows:
        ratio_suma = (s.monto_reclamado or 0) / p.suma_asegurada
        ratio_estimado = None
        if s.monto_estimado and s.monto_estimado > 0:
            ratio_estimado = (s.monto_reclamado or 0) / s.monto_estimado

        if ratio_suma >= umbral_ratio or (ratio_estimado and ratio_estimado >= 1.5):
            resultado.append({
                "id_siniestro":      s.id_siniestro,
                "ramo":              s.ramo,
                "cobertura":         s.cobertura,
                "monto_reclamado":   _serial(s.monto_reclamado),
                "monto_estimado":    _serial(s.monto_estimado),
                "suma_asegurada":    _serial(p.suma_asegurada),
                "ratio_vs_suma":     round(ratio_suma * 100, 1),
                "ratio_vs_estimado": round(ratio_estimado * 100, 1) if ratio_estimado else None,
                "nivel_riesgo":      s.nivel_riesgo,
                "score_riesgo":      _serial(s.score_riesgo),
            })

    resultado.sort(key=lambda x: x["ratio_vs_suma"], reverse=True)
    return {"items": resultado[:limit], "total_devuelto": len(resultado[:limit])}


# ── 8. Siniestros cercanos al borde de vigencia ───────────────────────────────

@router.get("/borde-vigencia", summary="Siniestros cerca del inicio o fin de póliza")
def borde_vigencia(
    dias_umbral: int = Query(30),
    limit:       int = Query(20, ge=1, le=100),
    db:          Session = Depends(get_db),
):
    items = (
        db.query(Siniestro)
        .filter(
            Siniestro.dias_desde_inicio_poliza != None,  # noqa: E711
            Siniestro.dias_desde_fin_poliza    != None,  # noqa: E711
        )
        .filter(
            (Siniestro.dias_desde_inicio_poliza <= dias_umbral) |
            (Siniestro.dias_desde_fin_poliza    <= dias_umbral)
        )
        .order_by(
            func.least(
                func.coalesce(Siniestro.dias_desde_inicio_poliza, 9999),
                func.coalesce(Siniestro.dias_desde_fin_poliza, 9999),
            )
        )
        .limit(limit)
        .all()
    )

    def _safe_row(s: Siniestro) -> dict:
        """Serializa todos los campos del siniestro limpiando nan/inf."""
        alertas = []
        if s.alertas_activadas:
            try:
                alertas = json.loads(s.alertas_activadas)
            except (json.JSONDecodeError, TypeError):
                alertas = []

        return {
            "id_siniestro":             s.id_siniestro,
            "ramo":                     s.ramo,
            "cobertura":                s.cobertura,
            "estado":                   s.estado,
            "sucursal":                 s.sucursal,
            "nivel_riesgo":             s.nivel_riesgo,
            "beneficiario":             s.beneficiario,
            "alertas":                  alertas,
            # Todos los numéricos pasan por _serial
            "monto_reclamado":          _serial(s.monto_reclamado),
            "monto_estimado":           _serial(s.monto_estimado),
            "monto_pagado":             _serial(s.monto_pagado),
            "score_riesgo":             _serial(s.score_riesgo),
            "historial_siniestros_asegurado": _serial(s.historial_siniestros_asegurado),
            # Fechas
            "fecha_ocurrencia":         _serial(s.fecha_ocurrencia),
            "fecha_reporte":            _serial(s.fecha_reporte),
            # Días — usan _safe_dias para garantizar int
            "dias_desde_inicio_poliza": _safe_dias(s.dias_desde_inicio_poliza),
            "dias_desde_fin_poliza":    _safe_dias(s.dias_desde_fin_poliza),
            "dias_entre_ocurrencia_reporte": _safe_dias(s.dias_entre_ocurrencia_reporte),
            "borde_minimo_dias":        min(
                _safe_dias(s.dias_desde_inicio_poliza),
                _safe_dias(s.dias_desde_fin_poliza),
            ),
        }

    return {
        "dias_umbral_usado": dias_umbral,
        "total_devuelto":    len(items),
        "items":             [_safe_row(s) for s in items],
    }

# ── 9. Documentos faltantes en casos críticos ─────────────────────────────────

@router.get("/documentos-faltantes", summary="Documentos ausentes o inconsistentes en casos de alto riesgo")
def documentos_faltantes(
    solo_criticos: bool    = Query(True),
    db:            Session = Depends(get_db),
):
    q = db.query(Documento).join(
        Siniestro, Documento.id_siniestro == Siniestro.id_siniestro
    )
    if solo_criticos:
        q = q.filter(Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']))
    docs = q.all()

    por_tipo: dict = {}
    for d in docs:
        tipo = d.tipo_documento or "Sin tipo"
        if tipo not in por_tipo:
            por_tipo[tipo] = {
                "tipo_documento":      tipo,
                "total":               0,
                "no_entregados":       0,
                "ilegibles":           0,
                "con_inconsistencias": 0,
            }
        por_tipo[tipo]["total"] += 1
        if not d.entregado:
            por_tipo[tipo]["no_entregados"] += 1
        if not d.legible:
            por_tipo[tipo]["ilegibles"] += 1
        if d.inconsistencia_detectada:
            por_tipo[tipo]["con_inconsistencias"] += 1

    q_casos = (
        db.query(func.count(func.distinct(Siniestro.id_siniestro)))
        .join(Documento, Documento.id_siniestro == Siniestro.id_siniestro)
        .filter(
            (Documento.inconsistencia_detectada == True) |  # noqa: E712
            (Documento.legible == False)                    # noqa: E712
        )
    )
    if solo_criticos:
        q_casos = q_casos.filter(Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']))
    casos_con_problemas = q_casos.scalar() or 0

    resumen = sorted(
        por_tipo.values(),
        key=lambda x: x["con_inconsistencias"] + x["no_entregados"],
        reverse=True,
    )
    return {
        "casos_con_problemas_documentales": casos_con_problemas,
        "solo_criticos":      solo_criticos,
        "por_tipo_documento": resumen,
    }


# ── 10. Patrones repetidos en reclamos sospechosos ────────────────────────────

@router.get("/patrones-repetidos", summary="Patrones frecuentes en alertas de casos sospechosos")
def patrones_repetidos(db: Session = Depends(get_db)):
    siniestros_riesgo = (
        db.query(Siniestro)
        .filter(
            Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']),
            Siniestro.alertas_activadas != None,  # noqa: E711
        )
        .all()
    )

    conteo_alertas: dict = {}
    total_analizados = 0

    for s in siniestros_riesgo:
        try:
            alertas = json.loads(s.alertas_activadas)
        except (json.JSONDecodeError, TypeError):
            continue
        total_analizados += 1
        for alerta in alertas:
            clave = _clave_alerta(alerta)
            conteo_alertas[clave] = conteo_alertas.get(clave, 0) + 1

    patrones = sorted(
        [
            {
                "patron":     k,
                "frecuencia": v,
                "porcentaje": _porcentaje(v, total_analizados),
            }
            for k, v in conteo_alertas.items()
        ],
        key=lambda x: x["frecuencia"],
        reverse=True,
    )
    return {
        "total_casos_analizados": total_analizados,
        "patrones":               patrones[:20],
    }


# ── 11. Resumen ejecutivo (para el agente IA) ─────────────────────────────────

@router.get("/resumen-ejecutivo", summary="Resumen ejecutivo de casos críticos para el analista")
def resumen_ejecutivo(
    top_n: int     = Query(5, ge=1, le=20),
    db:    Session = Depends(get_db),
):
    total     = db.query(Siniestro).count()
    rojos     = db.query(Siniestro).filter(Siniestro.nivel_riesgo == 'Rojo').count()
    amarillos = db.query(Siniestro).filter(Siniestro.nivel_riesgo == 'Amarillo').count()

    monto_total  = float(db.query(func.sum(Siniestro.monto_reclamado)).scalar() or 0)
    monto_riesgo = float(
        db.query(func.sum(Siniestro.monto_reclamado))
        .filter(Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']))
        .scalar() or 0
    )
    score_promedio = float(db.query(func.avg(Siniestro.score_riesgo)).scalar() or 0)

    top_siniestros = (
        db.query(Siniestro)
        .filter(Siniestro.nivel_riesgo == 'Rojo')
        .order_by(desc(Siniestro.score_riesgo))
        .limit(top_n)
        .all()
    )

    top_proveedores = (
        db.query(
            Siniestro.beneficiario,
            func.count(Siniestro.id_siniestro).label("casos"),
        )
        .filter(
            Siniestro.beneficiario != None,  # noqa: E711
            Siniestro.nivel_riesgo.in_(['Rojo', 'Amarillo']),
        )
        .group_by(Siniestro.beneficiario)
        .order_by(desc("casos"))
        .limit(3)
        .all()
    )

    ramo_critico = (
        db.query(Siniestro.ramo, func.count(Siniestro.id_siniestro).label("n"))
        .filter(Siniestro.nivel_riesgo == 'Rojo')
        .group_by(Siniestro.ramo)
        .order_by(desc("n"))
        .first()
    )

    return {
        "resumen": {
            "total_siniestros":         total,
            "casos_criticos_rojos":     rojos,
            "casos_revision_amarillos": amarillos,
            "porcentaje_en_riesgo":     _porcentaje(rojos + amarillos, total),
            "monto_total_reclamado":    round(monto_total, 2),
            "monto_en_riesgo":          round(monto_riesgo, 2),
            "porcentaje_monto_riesgo":  _porcentaje(int(monto_riesgo), int(monto_total)),
            "score_promedio_general":   round(score_promedio, 1),
        },
        "top_siniestros_criticos": [_siniestro_base(s) for s in top_siniestros],
        "proveedores_con_mas_alertas": [
            {"id_proveedor": r.beneficiario, "casos_sospechosos": r.casos}
            for r in top_proveedores
        ],
        "ramo_mas_critico": {
            "ramo":        ramo_critico.ramo if ramo_critico else None,
            "casos_rojos": ramo_critico.n if ramo_critico else 0,
        },
        "nota": (
            "Este resumen presenta alertas para revisión humana. "
            "Ningún resultado constituye una acusación de fraude."
        ),
    }