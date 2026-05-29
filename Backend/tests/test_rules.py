"""Pruebas unitarias del motor de reglas (evaluar_reglas)."""
from datetime import date

import pytest

from app.core.fraud_rules import evaluar_reglas
from app.model import Asegurado, Poliza, Proveedor, Siniestro


def _siniestro(**kwargs) -> Siniestro:
    base = dict(
        id_siniestro="SIN-TEST",
        id_poliza="POL-001",
        id_asegurado="ASE-001",
        ramo="Vida",
        cobertura="Choque",
        fecha_ocurrencia=date(2024, 1, 1),
        fecha_reporte=date(2024, 1, 5),
        monto_reclamado=5000.0,
        estado="Reserva",
        documentos_completos=True,
        dias_desde_inicio_poliza=90,
        dias_desde_fin_poliza=180,
        dias_entre_ocurrencia_reporte=4,
        historial_siniestros_asegurado=0,
    )
    base.update(kwargs)
    return Siniestro(**base)


def _poliza(**kwargs) -> Poliza:
    base = dict(
        id_poliza="POL-001",
        id_asegurado="ASE-001",
        ramo="Vida",
        fecha_inicio=date(2024, 1, 1),
        fecha_fin=date(2025, 1, 1),
        suma_asegurada=50000.0,
        prima=500.0,
        deducible=200.0,
    )
    base.update(kwargs)
    return Poliza(**base)


def _asegurado(**kwargs) -> Asegurado:
    base = dict(
        id_asegurado="ASE-001",
        segmento="Natural",
        antiguedad=3,
        ciudad="Quito",
        score_cliente=70,
        reclamos_ultimos_12_meses=0,
        mora_actual=False,
    )
    base.update(kwargs)
    return Asegurado(**base)


def test_regla_borde_vigencia_puntaje(db):
    siniestro = _siniestro(dias_desde_inicio_poliza=5, dias_desde_fin_poliza=200)
    res = evaluar_reglas(db, siniestro, _poliza(), _asegurado())
    assert res["score_reglas"] >= 8
    assert any("borde de vigencia" in a.lower() for a in res["alertas"])


def test_regla_demora_robo(db):
    siniestro = _siniestro(cobertura="Robo", dias_entre_ocurrencia_reporte=5)
    res = evaluar_reglas(db, siniestro, _poliza(), _asegurado())
    assert res["score_reglas"] >= 8
    assert any("denuncia de robo" in a.lower() for a in res["alertas"])


def test_regla_rf03_lista_restrictiva(db):
    db.add(
        Proveedor(
            id_proveedor="PROV-LISTA",
            tipo="Taller",
            ciudad="Quito",
            reclamos_asociados=10,
            porcentaje_casos_observados=75.0,
            monto_promedio_reclamado=5000.0,
            antiguedad=1,
        )
    )
    db.commit()

    siniestro = _siniestro(beneficiario="PROV-LISTA")
    res = evaluar_reglas(db, siniestro, _poliza(), _asegurado())
    assert res["nivel_critico"] == "Rojo"
    assert any("RF-03" in a for a in res["alertas"])


def test_regla_rf02_documento_inconsistente(db, prepare_database):
    """Usa DOC-001 del seed (inconsistencia en SIN-00001)."""
    siniestro = db.query(Siniestro).filter(Siniestro.id_siniestro == "SIN-00001").one()
    poliza = db.query(Poliza).filter(Poliza.id_poliza == siniestro.id_poliza).one()
    asegurado = db.query(Asegurado).filter(Asegurado.id_asegurado == siniestro.id_asegurado).one()

    res = evaluar_reglas(db, siniestro, poliza, asegurado)
    assert any("RF-02" in a for a in res["alertas"])
    assert res["nivel_critico"] == "Rojo"
