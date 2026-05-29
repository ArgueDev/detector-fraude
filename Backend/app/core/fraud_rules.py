"""
Reglas de negocio para detección de posible fraude.

IMPORTANTE: Este módulo genera ALERTAS DE REVISIÓN
"""
import json
from sqlalchemy.orm import Session
from ..model.siniestro import Siniestro
from ..model.poliza import Poliza
from ..model.asegurado import Asegurado
from ..model.documento import Documento
from ..model.proveedor import Proveedor


# Sección 7: Señales de posible fraude

def _regla_borde_vigencia(siniestro: Siniestro) -> tuple[int, str | None]:
    """RF: Reclamo cercano al borde de vigencia. Máx 8 pts."""
    dias = siniestro.dias_desde_inicio_poliza or 999
    dias_fin = siniestro.dias_desde_fin_poliza or 999
    dias_min = min(dias, dias_fin)

    if dias_min <= 10:
        return 8, f"Siniestro ocurrido a solo {dias_min} días del borde de vigencia (≤10 días: 8 pts)"
    elif dias_min <= 30:
        return 4, f"Siniestro ocurrido a {dias_min} días del borde de vigencia (11-30 días: 4 pts)"
    return 0, None


def _regla_demora_denuncia_robo(siniestro: Siniestro) -> tuple[int, str | None]:
    """RF: Demora en denuncia por robo. Máx 8 pts."""
    if siniestro.cobertura and 'robo' in siniestro.cobertura.lower():
        horas = (siniestro.dias_entre_ocurrencia_reporte or 0) * 24
        if horas > 48:
            return 8, f"Demora de {siniestro.dias_entre_ocurrencia_reporte} días en denuncia de robo (>48h: 8 pts)"
        elif horas >= 24:
            return 4, f"Demora de {siniestro.dias_entre_ocurrencia_reporte} días en denuncia de robo (24-48h: 4 pts)"
    return 0, None


def _regla_frecuencia_asegurado(siniestro: Siniestro) -> tuple[int, str | None]:
    """RF: Alta frecuencia de reclamos por asegurado. Máx 8 pts."""
    historial = siniestro.historial_siniestros_asegurado or 0
    if historial >= 3:
        return 8, f"Asegurado con {historial} siniestros previos en 18 meses (≥3: 8 pts)"
    elif historial == 2:
        return 4, f"Asegurado con {historial} siniestros previos en 18 meses (2: 4 pts)"
    return 0, None


def _regla_documentos_incompletos(siniestro: Siniestro) -> tuple[int, str | None]:
    """RF: Documentos incompletos. Máx 4 pts."""
    if not siniestro.documentos_completos:
        return 4, "Documentos del siniestro incompletos — falta documentación legal obligatoria (4 pts)"
    return 0, None


def _regla_reporte_tardio(siniestro: Siniestro) -> tuple[int, str | None]:
    """RF: Reporte tardío del siniestro. Máx 5 pts."""
    dias = siniestro.dias_entre_ocurrencia_reporte or 0
    if dias > 7:
        return 5, f"Siniestro reportado {dias} días después del evento (>7 días: 5 pts)"
    elif dias >= 4:
        return 3, f"Siniestro reportado {dias} días después del evento (4-7 días: 3 pts)"
    return 0, None


def _regla_documentos_inconsistentes(db: Session, siniestro: Siniestro) -> tuple[int, str | None]:
    """RF: Documentos inconsistentes. Máx 10 pts."""
    docs = db.query(Documento).filter(
        Documento.id_siniestro == siniestro.id_siniestro
    ).all()

    inconsistentes = [d for d in docs if d.inconsistencia_detectada]
    ilegibles      = [d for d in docs if not d.legible]

    if inconsistentes:
        tipos = ", ".join(d.tipo_documento for d in inconsistentes)
        return 10, f"Inconsistencias detectadas en documentos: {tipos} (10 pts)"
    elif ilegibles:
        tipos = ", ".join(d.tipo_documento for d in ilegibles)
        return 5, f"Documentos ilegibles detectados: {tipos} (5 pts)"
    return 0, None


def _regla_proveedor_recurrente(db: Session, siniestro: Siniestro) -> tuple[int, str | None]:
    """RF: Beneficiario/Proveedor recurrente. Máx 10 pts."""
    if not siniestro.beneficiario:
        return 0, None

    proveedor = db.query(Proveedor).filter(
        Proveedor.id_proveedor == siniestro.beneficiario
    ).first()

    if not proveedor:
        return 0, None

    # Lista restrictiva simulada: porcentaje de casos observados > 50%
    if proveedor.porcentaje_casos_observados and proveedor.porcentaje_casos_observados >= 50:
        return 10, f"Proveedor {siniestro.beneficiario} en lista restrictiva (10 pts)"
    elif proveedor.reclamos_asociados and proveedor.reclamos_asociados > 2:
        return 5, f"Proveedor {siniestro.beneficiario} con {proveedor.reclamos_asociados} casos observados este año (5 pts)"
    return 0, None


def _regla_monto_atipico(siniestro: Siniestro, poliza: Poliza) -> tuple[int, str | None]:
    """RF: Monto cercano o superior a suma asegurada. Máx 5 pts."""
    if not poliza or not poliza.suma_asegurada or poliza.suma_asegurada == 0:
        return 0, None

    ratio = (siniestro.monto_reclamado or 0) / poliza.suma_asegurada
    if ratio >= 0.95:
        return 4, f"Monto reclamado ({siniestro.monto_reclamado}) representa el {ratio*100:.1f}% de la suma asegurada (≥95%: 4 pts)"
    return 0, None


# Sección 8: Reglas críticas RF-01 a RF-07

def _regla_rf01_perdida_total_robo(siniestro: Siniestro) -> tuple[str | None, str]:
    cobertura = (siniestro.cobertura or '').lower()
    keywords = ['pérdida total', 'perdida total', 'robo', 'hurto']
    if any(k in cobertura for k in keywords):
        # Solo es Rojo si además el monto es muy alto
        if siniestro.monto_reclamado and siniestro.monto_reclamado > 20000:
            return 'Rojo', "RF-01: Cobertura de robo/pérdida total con monto elevado — requiere revisión especializada"
    return None, ""


def _regla_rf02_falsificacion_documental(db: Session, siniestro: Siniestro) -> tuple[str | None, str]:
    """RF-02: Falsificación o Adulteración Documental Evidente → Rojo."""
    docs = db.query(Documento).filter(
        Documento.id_siniestro == siniestro.id_siniestro,
        Documento.inconsistencia_detectada == True
    ).all()
    if docs:
        return 'Rojo', f"RF-02: Posible adulteración documental detectada en {len(docs)} documento(s)"
    return None, ""


def _regla_rf03_lista_restrictiva(db: Session, siniestro: Siniestro) -> tuple[str | None, str]:
    """RF-03: Coincidencia con Lista Restrictiva → Rojo."""
    if not siniestro.beneficiario:
        return None, ""
    proveedor = db.query(Proveedor).filter(
        Proveedor.id_proveedor == siniestro.beneficiario,
        Proveedor.porcentaje_casos_observados >= 50,
    ).first()
    if proveedor:
        return (
            'Rojo',
            f"RF-03: Beneficiario/Proveedor {siniestro.beneficiario} coincide con lista restrictiva",
        )
    return None, ""


def _regla_rf05_borde_extremo(siniestro: Siniestro) -> tuple[str | None, str]:
    """RF-05: Siniestro extremo al borde de vigencia (<48 hrs) → Amarillo."""
    dias = min(
        siniestro.dias_desde_inicio_poliza or 999,
        siniestro.dias_desde_fin_poliza or 999
    )
    if dias < 2:  # menos de 48 horas
        return 'Amarillo', f"RF-05: Siniestro ocurrido a {dias} días del borde de vigencia (<48 hrs)"
    return None, ""


def _regla_rf06_demora_atipica_robo(siniestro: Siniestro) -> tuple[str | None, str]:
    """RF-06: Demora atípica en denuncia de robo (>4 días) → Amarillo."""
    if siniestro.cobertura and 'robo' in siniestro.cobertura.lower():
        if (siniestro.dias_entre_ocurrencia_reporte or 0) > 4:
            return 'Amarillo', f"RF-06: Denuncia de robo con {siniestro.dias_entre_ocurrencia_reporte} días de demora (>4 días)"
    return None, ""

def _regla_rf07_narrativa_similar(db: Session, siniestro: Siniestro) -> tuple[str | None, str]:
    """RF-07: Narrativa idéntica o clonada → Amarillo."""
    if not siniestro.descripcion or len(siniestro.descripcion) < 10:
        return None, ""

    # Buscar siniestros con la misma descripción exacta
    duplicados = db.query(Siniestro).filter(
        Siniestro.descripcion == siniestro.descripcion,
        Siniestro.id_siniestro != siniestro.id_siniestro
    ).count()

    if duplicados > 0:
        return 'Amarillo', f"RF-07: Narrativa idéntica encontrada en {duplicados} siniestro(s) — posible clonación"
    return None, ""

# ── Función principal ─────────────────────────────────────────────────────────

def evaluar_reglas(
    db: Session,
    siniestro: Siniestro,
    poliza: Poliza,
    asegurado: Asegurado
) -> dict:
    """
    Evalúa todas las reglas de negocio sobre un siniestro.

    Retorna:
        score_reglas    : int  (0-100)
        alertas         : list[str]
        nivel_critico   : str | None  ('Rojo' | 'Amarillo') si hay regla crítica activada
    """
    score      = 0
    alertas    = []
    nivel_critico = None

    # ── Señales de puntuación (sección 7) ─────────────────────────────────────
    reglas_puntaje = [
        _regla_borde_vigencia(siniestro),
        _regla_demora_denuncia_robo(siniestro),
        _regla_frecuencia_asegurado(siniestro),
        _regla_documentos_incompletos(siniestro),
        _regla_reporte_tardio(siniestro),
        _regla_documentos_inconsistentes(db, siniestro),
        _regla_proveedor_recurrente(db, siniestro),
        _regla_monto_atipico(siniestro, poliza),
    ]

    for pts, mensaje in reglas_puntaje:
        if pts > 0 and mensaje:
            score += pts
            alertas.append(mensaje)

    # Normalizar score a 100
    score = min(score, 100)

    # ── Reglas críticas (sección 8) ────────────────────────────────────────────
    reglas_criticas = [
        _regla_rf01_perdida_total_robo(siniestro),
        _regla_rf02_falsificacion_documental(db, siniestro),
        _regla_rf03_lista_restrictiva(db, siniestro),
        _regla_rf05_borde_extremo(siniestro),
        _regla_rf06_demora_atipica_robo(siniestro),
        _regla_rf07_narrativa_similar(db, siniestro),
    ]

    PRIORIDAD = {'Rojo': 2, 'Amarillo': 1, None: 0}

    for nivel, mensaje in reglas_criticas:
        if nivel:
            alertas.append(mensaje)
            if PRIORIDAD.get(nivel, 0) > PRIORIDAD.get(nivel_critico, 0):
                nivel_critico = nivel

    return {
        'score_reglas':  score,
        'alertas':       alertas,
        'nivel_critico': nivel_critico,
    }


def guardar_resultado_reglas(db: Session, siniestro: Siniestro, resultado: dict) -> None:
    """Persiste las alertas en el campo alertas_activadas del siniestro."""
    siniestro.alertas_activadas = json.dumps(resultado['alertas'], ensure_ascii=False)
    db.commit()