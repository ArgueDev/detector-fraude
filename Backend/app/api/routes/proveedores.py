from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ...core.database import get_db
from ...model import Proveedor

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])

@router.get("/")
def listar_proveedores(db: Session = Depends(get_db)):
    items = db.query(Proveedor).all()
    return {"total": len(items), "items": items}

@router.get("/alertas")
def proveedores_con_alertas(db: Session = Depends(get_db)):
    items = (db.query(Proveedor)
               .order_by(desc(Proveedor.porcentaje_casos_observados))
               .limit(20).all())
    return {"items": items}