import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
from app.core.database import engine, Base, SessionLocal
from app.model import Asegurado, Proveedor, Poliza, Siniestro, Documento

def load_table(db, Model, csv_path, col_map={}):
    df = pd.read_csv(csv_path)
    df = df.rename(columns=col_map)
    df = df.where(pd.notna(df), None)
    # Solo columnas que existen en el modelo
    valid_cols = [c.key for c in Model.__table__.columns]
    df = df[[c for c in df.columns if c in valid_cols]]
    records = df.to_dict('records')
    db.bulk_insert_mappings(Model, records)
    db.commit()
    print(f"  {Model.__tablename__:15s}: {len(records)} registros insertados")

def seed():
    print("Conectando a la base de datos...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    print("Cargando datos:\n")
    try:
        load_table(db, Asegurado, 'data/synthetic/asegurados.csv', {
            'antiguedad':    'antiguedad',
            'numero_polizas': 'numero_polizas',
        })
        load_table(db, Proveedor, 'data/synthetic/proveedores.csv')
        load_table(db, Poliza,    'data/synthetic/polizas.csv')
        load_table(db, Siniestro, 'data/synthetic/siniestros.csv')
        load_table(db, Documento, 'data/synthetic/documentos.csv')
        print("\nBase de datos cargada exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"\nError: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()