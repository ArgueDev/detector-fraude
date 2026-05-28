"""
Explicabilidad del score de riesgo mediante Gemini.

Genera un informe ejecutivo legible para el analista de siniestros,
explicando POR QUÉ un caso fue marcado con determinado nivel de riesgo.

IMPORTANTE: El lenguaje siempre usa "requiere revisión" / "presenta señales
de riesgo". Nunca emite acusaciones de fraude.
"""

from google import genai
from ..core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


class FraudeExplainer:

    def explain_case(
        self,
        siniestro,
        score_reglas: int,
        score_ml: float,
        alertas_activadas: list[str],
        nivel_riesgo: str,
    ) -> str:
        """
        Genera una explicación en lenguaje natural del score asignado.

        Parámetros
        ----------
        siniestro         : ORM Siniestro con todos sus campos.
        score_reglas      : Puntaje 0-100 del motor de reglas.
        score_ml          : Probabilidad 0.0-1.0 del modelo Random Forest.
        alertas_activadas : Lista de strings con los motivos activados.
        nivel_riesgo      : 'Verde' | 'Amarillo' | 'Rojo'

        Retorna
        -------
        str  — Informe ejecutivo en Markdown listo para mostrar en el dashboard.
             En caso de fallo de Gemini devuelve el fallback determinístico.
        """
        prompt = f"""
Eres un asistente experto en detección de fraude para una compañía de seguros.
Redacta un informe ejecutivo profesional para un analista de siniestros.
Nunca acuses de fraude directamente; usa lenguaje como "requiere revisión" o "presenta señales de riesgo".

=== DATOS DEL SINIESTRO ===
- ID: {siniestro.id_siniestro}
- Ramo: {siniestro.ramo}
- Cobertura: {siniestro.cobertura}
- Fecha ocurrencia: {siniestro.fecha_ocurrencia}
- Fecha reporte: {siniestro.fecha_reporte}
- Días entre ocurrencia y reporte: {siniestro.dias_entre_ocurrencia_reporte}
- Monto reclamado: {siniestro.monto_reclamado}
- Monto estimado: {siniestro.monto_estimado}
- Documentos completos: {siniestro.documentos_completos}
- Beneficiario: {siniestro.beneficiario}
- Días desde inicio póliza: {siniestro.dias_desde_inicio_poliza}
- Historial siniestros previos: {siniestro.historial_siniestros_asegurado}
- Descripción: {siniestro.descripcion}

=== SCORES DE RIESGO ===
- Score reglas de negocio: {score_reglas} / 100
- Score modelo ML: {score_ml:.3f} / 1.0
- Nivel de riesgo asignado: {nivel_riesgo}

=== ALERTAS ACTIVADAS ===
{chr(10).join(['- ' + a for a in alertas_activadas]) if alertas_activadas else '- Ninguna alerta activada'}

=== FORMATO DE RESPUESTA REQUERIDO ===
1. **Nivel de riesgo**: {nivel_riesgo}
2. **Resumen ejecutivo** (máximo 60 palabras)
3. **Factores determinantes** (lista con viñetas)
4. **Acción sugerida para el analista** (una frase concreta)
"""
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text
        except Exception as e:
            print(f"[explain_score] Gemini falló: {e}")
            return self._fallback_explanation(
                siniestro, score_reglas, score_ml, alertas_activadas, nivel_riesgo
            )

    def _fallback_explanation(
        self,
        siniestro,
        score_reglas: int,
        score_ml: float,
        alertas_activadas: list[str],
        nivel_riesgo: str,
    ) -> str:
        """
        Explicación determinística cuando Gemini no está disponible.
        No depende de ninguna API externa — siempre funciona.
        """
        texto = f"⚠️ Nivel de Riesgo: **{nivel_riesgo}**\n\n"
        texto += (
            f"El siniestro {siniestro.id_siniestro} obtuvo un puntaje de "
            f"{score_reglas}/100 en reglas de negocio y una probabilidad "
            f"de anomalía de {score_ml:.2f} en el modelo ML.\n"
        )
        if alertas_activadas:
            texto += "\n**Motivos para revisión:**\n"
            for a in alertas_activadas:
                texto += f"- {a}\n"
        texto += (
            "\n*Este análisis es una alerta de revisión, "
            "no una acusación de fraude.*"
        )
        return texto


# Singleton — se inicializa una vez al arrancar la aplicación.
# La API key se lee de config en tiempo de importación.
explainer = FraudeExplainer()