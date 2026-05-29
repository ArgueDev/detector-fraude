"""
Fixtures compartidas: SQLite en memoria, datos minimos, TestClient.
No requiere PostgreSQL ni llamadas reales a Gemini.
"""
import os
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Forzar SQLite en tests (ignora .env de desarrollo con PostgreSQL)
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["GEMINI_API_KEY"] = "test-key-no-gemini"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.model import Asegurado, Documento, Poliza, Proveedor, Siniestro

# StaticPool: una sola conexion en memoria (evita "no such table" con :memory:)
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _seed(db) -> None:
    """Datos minimos para probar reglas y endpoints sin PostgreSQL."""
    db.add(
        Asegurado(
            id_asegurado="ASE-001",
            segmento="Natural",
            antiguedad=5,
            ciudad="Quito",
            numero_polizas=1,
            reclamos_ultimos_12_meses=0,
            mora_actual=False,
            score_cliente=70,
        )
    )
    db.add(
        Proveedor(
            id_proveedor="PROV-001",
            tipo="Taller",
            ciudad="Quito",
            reclamos_asociados=5,
            monto_promedio_reclamado=3000.0,
            porcentaje_casos_observados=60.0,
            antiguedad=3,
        )
    )
    db.add(
        Proveedor(
            id_proveedor="PROV-002",
            tipo="Clinica",
            ciudad="Guayaquil",
            reclamos_asociados=1,
            monto_promedio_reclamado=1500.0,
            porcentaje_casos_observados=10.0,
            antiguedad=2,
        )
    )
    db.add(
        Poliza(
            id_poliza="POL-001",
            id_asegurado="ASE-001",
            ramo="Vida",
            fecha_inicio=date(2024, 1, 1),
            fecha_fin=date(2025, 12, 31),
            prima=500.0,
            suma_asegurada=50000.0,
            deducible=200.0,
            canal_venta="Directo",
            ciudad="Quito",
            estado_poliza="Vigente",
        )
    )

    siniestros = [
        Siniestro(
            id_siniestro="SIN-00001",
            id_poliza="POL-001",
            id_asegurado="ASE-001",
            ramo="Vida",
            cobertura="Robo",
            fecha_ocurrencia=date(2024, 6, 1),
            fecha_reporte=date(2024, 6, 5),
            monto_reclamado=25000.0,
            monto_estimado=20000.0,
            monto_pagado=0.0,
            estado="Reserva",
            sucursal="Quito Norte",
            descripcion="Robo de vehiculo en via publica.",
            documentos_completos=True,
            beneficiario="PROV-001",
            dias_desde_inicio_poliza=8,
            dias_desde_fin_poliza=200,
            dias_entre_ocurrencia_reporte=4,
            historial_siniestros_asegurado=0,
            score_riesgo=0,
            nivel_riesgo="Verde",
        ),
        Siniestro(
            id_siniestro="SIN-00002",
            id_poliza="POL-001",
            id_asegurado="ASE-001",
            ramo="Vehiculos",
            cobertura="Choque",
            fecha_ocurrencia=date(2024, 7, 1),
            fecha_reporte=date(2024, 7, 2),
            monto_reclamado=1500.0,
            monto_estimado=1400.0,
            monto_pagado=0.0,
            estado="Liquidado",
            sucursal="Guayaquil",
            descripcion="Colision leve en interseccion.",
            documentos_completos=True,
            beneficiario="PROV-002",
            dias_desde_inicio_poliza=120,
            dias_desde_fin_poliza=90,
            dias_entre_ocurrencia_reporte=1,
            historial_siniestros_asegurado=1,
            score_riesgo=45,
            nivel_riesgo="Amarillo",
        ),
        Siniestro(
            id_siniestro="SIN-00003",
            id_poliza="POL-001",
            id_asegurado="ASE-001",
            ramo="Hogar",
            cobertura="Incendio",
            fecha_ocurrencia=date(2024, 8, 1),
            fecha_reporte=date(2024, 8, 10),
            monto_reclamado=8000.0,
            monto_estimado=7500.0,
            monto_pagado=0.0,
            estado="Reserva",
            sucursal="Cuenca",
            descripcion="Incendio en cocina por descuido.",
            documentos_completos=False,
            beneficiario="PROV-002",
            dias_desde_inicio_poliza=60,
            dias_desde_fin_poliza=150,
            dias_entre_ocurrencia_reporte=9,
            historial_siniestros_asegurado=2,
            score_riesgo=80,
            nivel_riesgo="Rojo",
        ),
    ]
    for s in siniestros:
        db.add(s)

    db.add(
        Documento(
            id_documento="DOC-001",
            id_siniestro="SIN-00001",
            tipo_documento="Factura Reparacion",
            entregado=True,
            legible=True,
            fecha_emision=date(2024, 6, 2),
            inconsistencia_detectada=True,
            observacion="Posible alteracion",
        )
    )
    db.commit()


@pytest.fixture(scope="session", autouse=True)
def prepare_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        _seed(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
