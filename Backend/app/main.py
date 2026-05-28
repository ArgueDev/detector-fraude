from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes.siniestros import router as siniestros_router
from .api.routes.estadisticas import router as estadisticas_router
from .api.routes.proveedores import router as proveedores_router
from .api.routes.chat import router as chat_router

app = FastAPI(title='Detector de Fraudes - Aseguradora del Sur')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(siniestros_router, prefix="/api/v1")
app.include_router(estadisticas_router, prefix="/api/v1")
app.include_router(proveedores_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")

@app.get('/')
def root():
    return {'message': 'API funcionando', 'status': 'ok'}