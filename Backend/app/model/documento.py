from sqlalchemy import Column, Integer, String, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship

from ..core.database import Base

class Documento(Base):
    __tablename__ = 'documento'

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_documento = Column(String(50), unique=True, nullable=False, index=True)
    id_siniestro = Column(String(50), ForeignKey('siniestro.id_siniestro'), nullable=False, index=True)
    tipo_documento = Column(String(100))
    entregado = Column(Boolean, default=False)
    legible = Column(Boolean, default=True)
    fecha_emision = Column(Date)
    inconsistencia_detectada = Column(Boolean, default=False)
    observacion = Column(Text)

    # Relaciones
    siniestro = relationship('Siniestro', back_populates='documento')

