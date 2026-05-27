from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from ..core.database import Base

class Asegurado(Base):
    __tablename__ = 'asegurado'

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_asegurado = Column(String(50), unique=True, nullable=False, index=True)
    segmento = Column(String(50))
    antiguedad = Column(Integer)
    ciudad = Column(String(100))
    numero_polizas = Column(Integer, default=0)
    reclamos_ultimos_12_meses = Column(Integer, default=0)
    mora_actual = Column(Boolean, default=False)
    score_cliente = Column(Integer)

    # Relaciones
    poliza = relationship('Poliza', back_populates='asegurado')
    siniestro = relationship('Siniestro', back_populates='asegurado')