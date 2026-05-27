from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from ..core.database import Base

class Poliza(Base):
    __tablename__ = 'poliza'

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_poliza = Column(String(50), unique=True, nullable=False, index=True)
    id_asegurado = Column(String(50), ForeignKey('asegurado.id_asegurado'), nullable=False, index=True)
    ramo = Column(String(50), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    prima = Column(Float)
    suma_asegurada = Column(Float)
    deducible = Column(Float)
    canal_venta = Column(String(100))
    ciudad = Column(String(100))
    estado_poliza = Column(String(50))

    # Relaciones
    asegurado = relationship('Asegurado', back_populates='poliza')
    siniestro = relationship('Siniestro', back_populates='poliza')
