from sqlalchemy import Column, Integer, String, Float, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship

from ..core.database import Base


class Siniestro(Base):
    __tablename__ = 'siniestro'

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_siniestro = Column(String(50), unique=True, nullable=False, index=True)
    id_poliza = Column(String(50), ForeignKey('poliza.id_poliza'), nullable=False, index=True)
    id_asegurado = Column(String(50), ForeignKey('asegurado.id_asegurado'), nullable=False, index=True)
    ramo = Column(String(50), nullable=False)
    cobertura = Column(String(50), nullable=False)
    fecha_ocurrencia = Column(Date, nullable=False)
    fecha_reporte = Column(Date, nullable=False)
    monto_reclamado = Column(Float, nullable=False)
    monto_estimado = Column(Float)
    monto_pagado = Column(Float)
    estado = Column(String(50), nullable=False)
    sucursal = Column(String(100))
    descripcion = Column(Text)
    documentos_completos = Column(Boolean, default=False)
    beneficiario = Column(String(200))
    dias_desde_inicio_poliza = Column(Integer)
    dias_desde_fin_poliza = Column(Integer)
    dias_entre_ocurrencia_reporte = Column(Integer)
    historial_siniestros_asegurado = Column(Integer, default=0)
    score_riesgo = Column(Integer, default=0)
    nivel_riesgo = Column(String(20), default='Verde')
    alertas_activadas = Column(Text)

    # Relaciones
    poliza = relationship('Poliza', back_populates='siniestro')
    asegurado = relationship('Asegurado', back_populates='siniestro')
    documento = relationship('Documento', back_populates='siniestro')
