import sys
import os

# Agregar la carpeta backend al path de Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.model import Siniestro, Poliza, Asegurado, Proveedor, Documento

def init_db():
    print("Conectando a PostgreSQL...")
    try:
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente")
        print("   - siniestros")
        print("   - polizas")
        print("   - asegurados")
        print("   - proveedores")
        print("   - documentos")
    except Exception as e:
        print(f"❌ Error al crear tablas: {e}")

if __name__ == "__main__":
    init_db()