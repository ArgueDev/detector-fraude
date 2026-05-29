"""Pruebas de API con TestClient (sin servidor externo ni Gemini)."""
import math
from unittest.mock import patch

import pytest


def test_health(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


class TestSiniestros:
    def test_listar(self, client):
        r = client.get("/api/v1/siniestros/", params={"limit": 5})
        assert r.status_code == 200
        data = r.json()
        assert "total" in data and "items" in data
        assert data["total"] >= 3

    def test_ranking(self, client):
        r = client.get("/api/v1/siniestros/ranking", params={"limit": 2})
        assert r.status_code == 200
        assert len(r.json()["items"]) <= 2

    def test_detalle_ok(self, client):
        r = client.get("/api/v1/siniestros/SIN-00001")
        assert r.status_code == 200
        assert r.json()["id_siniestro"] == "SIN-00001"

    def test_detalle_404(self, client):
        r = client.get("/api/v1/siniestros/SIN-99999")
        assert r.status_code == 404

    def test_calcular_score(self, client):
        r = client.post("/api/v1/siniestros/SIN-00002/calcular-score")
        assert r.status_code == 200
        data = r.json()
        assert data["nivel_riesgo"] in ("Verde", "Amarillo", "Rojo")
        assert 0 <= data["score_riesgo"] <= 100
        assert isinstance(data["alertas"], list)


class TestEstadisticas:
    @pytest.mark.parametrize(
        "path,params,keys",
        [
            ("/api/v1/estadisticas/", {}, ["total_siniestros", "por_nivel"]),
            ("/api/v1/estadisticas/top-riesgo", {"limit": 5}, ["items"]),
            ("/api/v1/estadisticas/resumen-ejecutivo", {"top_n": 3}, ["resumen", "nota"]),
            ("/api/v1/estadisticas/proveedores-alertas", {"limit": 5}, ["items"]),
            ("/api/v1/estadisticas/ramos-sospechosos", {}, ["items"]),
            ("/api/v1/estadisticas/ciudades-alertas", {"limit": 5}, ["items"]),
            ("/api/v1/estadisticas/asegurados-frecuentes", {"limit": 5}, ["items"]),
            ("/api/v1/estadisticas/montos-atipicos", {"limit": 5}, ["items"]),
            ("/api/v1/estadisticas/borde-vigencia", {"dias_umbral": 30, "limit": 5}, ["items"]),
            (
                "/api/v1/estadisticas/documentos-faltantes",
                {},
                ["casos_con_problemas_documentales", "por_tipo_documento"],
            ),
            ("/api/v1/estadisticas/patrones-repetidos", {}, ["patrones"]),
        ],
    )
    def test_get_estadisticas(self, client, path, params, keys):
        r = client.get(path, params=params)
        assert r.status_code == 200
        data = r.json()
        for k in keys:
            assert k in data

    def test_borde_vigencia_sin_nan(self, client):
        r = client.get(
            "/api/v1/estadisticas/borde-vigencia",
            params={"dias_umbral": 30, "limit": 10},
        )
        assert r.status_code == 200
        text = r.text
        assert "NaN" not in text and "Infinity" not in text

        def _check(obj):
            if isinstance(obj, float):
                assert not math.isnan(obj) and not math.isinf(obj)
            elif isinstance(obj, dict):
                for v in obj.values():
                    _check(v)
            elif isinstance(obj, list):
                for v in obj:
                    _check(v)

        _check(r.json())


class TestProveedores:
    def test_listar(self, client):
        r = client.get("/api/v1/proveedores/")
        assert r.status_code == 200
        assert r.json()["total"] >= 2

    def test_alertas(self, client):
        r = client.get("/api/v1/proveedores/alertas")
        assert r.status_code == 200
        assert "items" in r.json()


class TestChatSinGemini:
    """Chat mockeado: no consume cuota de Gemini."""

    def test_limpiar_historial(self, client):
        r = client.post("/api/v1/chat/limpiar")
        assert r.status_code == 200
        assert r.json()["turnos_memoria"] == 0

    def test_historial_vacio(self, client):
        client.post("/api/v1/chat/limpiar")
        r = client.get("/api/v1/chat/historial")
        assert r.status_code == 200
        assert r.json()["turnos"] == 0

    @patch(
        "app.api.routes.chat.agent.ask",
        return_value="Alerta de revision: el caso presenta senales de riesgo moderado.",
    )
    def test_chat_mocked(self, mock_ask, client):
        r = client.post(
            "/api/v1/chat/",
            json={
                "summary": "Consulta de prueba",
                "value": {"pregunta": "Resumen de casos criticos"},
            },
        )
        assert r.status_code == 200
        assert len(r.text) > 20
        mock_ask.assert_called_once_with(pregunta="Resumen de casos criticos")
