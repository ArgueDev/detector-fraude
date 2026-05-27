from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes.siniestros import router as siniestros_router

app = FastAPI(title='Detector de Fraudes - Aseguradora del Sur')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(siniestros_router, prefix="/api/v1")

@app.get('/')
def root():
    return {'message': 'API funcionando', 'status': 'ok'}