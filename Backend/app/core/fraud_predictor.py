import joblib
import os
import numpy as np
from sqlalchemy.orm import Session
from ..model.siniestro import Siniestro
from ..model.poliza import Poliza
from ..model.asegurado import Asegurado

# ─ Rutas
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'model', 'ModeloEntrenado')

# ─ Carga de artefactos entrenados
rf_model     = joblib.load(os.path.join(MODELS_DIR, 'random_forest_fraud.joblib'))
features     = joblib.load(os.path.join(MODELS_DIR, 'model_features.joblib'))
le_ramo      = joblib.load(os.path.join(MODELS_DIR, 'le_ramo.joblib'))
le_cobertura = joblib.load(os.path.join(MODELS_DIR, 'le_cobertura.joblib'))


def _encode_safe(encoder, value: str) -> int:
    """Codifica una categoría; si es desconocida retorna 0 sin lanzar error."""
    try:
        return int(encoder.transform([value])[0])
    except ValueError:
        return 0


def predecir_fraude(siniestro: Siniestro, poliza: Poliza, asegurado: Asegurado) -> dict:
    """
    Recibe los ORM objects y retorna:
        - score_ml      : probabilidad 0.0 - 1.0
        - es_fraude_ml  : bool (umbral 0.5)
    """
    row = {
        'monto_reclamado':                siniestro.monto_reclamado or 0,
        'dias_desde_inicio_poliza':       siniestro.dias_desde_inicio_poliza or 0,
        'dias_desde_fin_poliza':          siniestro.dias_desde_fin_poliza or 0,
        'dias_entre_ocurrencia_reporte':  siniestro.dias_entre_ocurrencia_reporte or 0,
        'historial_siniestros_asegurado': siniestro.historial_siniestros_asegurado or 0,
        'score_cliente':                  asegurado.score_cliente or 50,
        'documentos_completos':           int(siniestro.documentos_completos or False),

        # Features derivadas
        'ratio_monto_suma':     (siniestro.monto_reclamado or 0) / ((poliza.suma_asegurada or 1) + 1),
        'ratio_monto_estimado': (siniestro.monto_reclamado or 0) / ((siniestro.monto_estimado or 1) + 1),
        'borde_inicio':         int((siniestro.dias_desde_inicio_poliza or 999) <= 30),
        'borde_fin':            int((siniestro.dias_desde_fin_poliza or 999) <= 30),
        'reporte_tardio':       int((siniestro.dias_entre_ocurrencia_reporte or 0) > 7),

        # Categóricas codificadas
        'ramo_encoded':         _encode_safe(le_ramo, siniestro.ramo or 'Otro'),
        'cobertura_encoded':    _encode_safe(le_cobertura, siniestro.cobertura or 'Otro'),

        # Del asegurado
        'reclamos_ultimos_12_meses': asegurado.reclamos_ultimos_12_meses or 0,
        'antiguedad':                asegurado.antiguedad or 0,
        'mora_actual':               int(asegurado.mora_actual or False),

        # De la póliza
        'prima':     poliza.prima or 0,
        'deducible': poliza.deducible or 0,
    }

    X = np.array([[row[f] for f in features]])
    score_ml = float(rf_model.predict_proba(X)[0][1])
    es_fraude = score_ml >= 0.5

    return {
        'score_ml':     round(score_ml, 4),
        'es_fraude_ml': es_fraude,
    }


def calcular_score_final(score_reglas: int, score_ml: float) -> tuple[int, str]:
    """
    Combina el score de reglas (0-100) con el score ML (0-1)
    y retorna (score_final: int, nivel: str).
    
    Pesos: 60% reglas de negocio + 40% modelo ML
    """
    score_combinado = int((score_reglas * 0.6) + (score_ml * 100 * 0.4))
    score_final     = max(0, min(100, score_combinado))

    if score_final <= 40:
        nivel = 'Verde'
    elif score_final <= 75:
        nivel = 'Amarillo'
    else:
        nivel = 'Rojo'

    return score_final, nivel