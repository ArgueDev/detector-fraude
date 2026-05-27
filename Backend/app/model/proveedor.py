from sqlalchemy import Column, Integer, String, Float

from ..core.database import Base

class Proveedor(Base):
    __tablename__ = 'proveedor'

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_proveedor = Column(String(50), unique=True, nullable=False, index=True)
    tipo = Column(String(100))
    ciudad = Column(String(100))
    reclamos_asociados = Column(Integer, default=0)
    monto_promedio_reclamado = Column(Float)
    porcentaje_casos_observados = Column(Float)
    antiguedad = Column(Integer)
