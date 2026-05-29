"""Serialización JSON segura de siniestros para la API REST."""

import json
from datetime import date, datetime
from typing import Any

from ..model.siniestro import Siniestro


def _serial(val: Any) -> Any:
    if val is None:
        return None
    if isinstance(val, (date, datetime)):
        return val.isoformat()
    return val


def _parse_alertas(raw: str | None) -> list[str]:
    if not raw or not str(raw).strip():
        return []
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(a) for a in parsed]
    except (json.JSONDecodeError, TypeError):
        pass
    return [str(raw)]


def serializar_siniestro(s: Siniestro) -> dict[str, Any]:
    """Convierte un modelo ORM en dict JSON-serializable."""
    return {
        "id": s.id,
        "id_siniestro": s.id_siniestro,
        "id_poliza": s.id_poliza,
        "id_asegurado": s.id_asegurado,
        "ramo": s.ramo,
        "cobertura": s.cobertura,
        "fecha_ocurrencia": _serial(s.fecha_ocurrencia),
        "fecha_reporte": _serial(s.fecha_reporte),
        "monto_reclamado": s.monto_reclamado or 0,
        "monto_estimado": s.monto_estimado if s.monto_estimado is not None else 0,
        "monto_pagado": s.monto_pagado if s.monto_pagado is not None else 0,
        "estado": s.estado,
        "sucursal": s.sucursal or "",
        "descripcion": s.descripcion or "",
        "documentos_completos": bool(s.documentos_completos),
        "beneficiario": s.beneficiario or "",
        "dias_desde_inicio_poliza": s.dias_desde_inicio_poliza or 0,
        "dias_desde_fin_poliza": s.dias_desde_fin_poliza or 0,
        "dias_entre_ocurrencia_reporte": s.dias_entre_ocurrencia_reporte or 0,
        "historial_siniestros_asegurado": s.historial_siniestros_asegurado or 0,
        "score_riesgo": s.score_riesgo or 0,
        "nivel_riesgo": s.nivel_riesgo or "Verde",
        "alertas_activadas": json.dumps(
            _parse_alertas(s.alertas_activadas), ensure_ascii=False
        ),
        "etiqueta_fraude_simulada": s.etiqueta_fraude_simulada or 0,
        "tipo_fraude_simulado": s.tipo_fraude_simulado or "Ninguno",
    }
