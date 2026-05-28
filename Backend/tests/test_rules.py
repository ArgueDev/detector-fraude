import pytest
from app.core.fraud_rules import evaluar_fraude

@pytest.fixture
def siniestro_base():
    """Siniestro neutro (sin fraude) usado como punto de partida para cada regla."""
    return {
        "dias_desde_inicio_poliza": 30,
        "dias_desde_fin_poliza": 180,
        "dias_entre_ocurrencia_reporte": 5,
        "documentos_completos": True,
        "historial_siniestros_asegurado": 0,
        "score_riesgo": 0,
    }

def test_regla_borde_vigencia(siniestro_base):
    # Caso que debería activar la alerta "borde_vigencia"
    siniestro = siniestro_base.copy()
    siniestro.update({
        "dias_desde_inicio_poliza": 400,  # >365
        "dias_desde_fin_poliza": 400,    # >365
        "dias_entre_ocurrencia_reporte": 1,
        "documentos_completos": True,
        "historial_siniestros_asegurado": 0,
    })
    res = evaluar_fraude(siniestro)
    assert res["nivel_riesgo"] == "Rojo"
    assert "borde_vigencia" in res["alertas_activadas"]

def test_regla_demora_robo(siniestro_base):
    siniestro = siniestro_base.copy()
    siniestro.update({
        "dias_entre_ocurrencia_reporte": 45,  # >30 días
        "dias_desde_inicio_poliza": 10,
        "dias_desde_fin_poliza": 10,
    })
    res = evaluar_fraude(siniestro)
    assert "demora_robo" in res["alertas_activadas"]
    assert res["nivel_riesgo"] in ("Rojo", "Amarillo")

def test_regla_listas_restrictivas(siniestro_base):
    siniestro = siniestro_base.copy()
    siniestro["lista_restrictiva"] = True
    res = evaluar_fraude(siniestro)
    assert "listas_restrictivas" in res["alertas_activadas"]
    assert res["nivel_riesgo"] == "Rojo"
