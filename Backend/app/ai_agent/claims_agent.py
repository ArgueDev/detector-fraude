"""
claims_agent.py — Agente conversacional antifraude.

Responsabilidad única: mantener el historial y llamar a Gemini.
NO sabe nada de endpoints, base de datos ni estadísticas —
eso lo hace context_builder.py.

Detecta automáticamente si la pregunta menciona un id_siniestro
(ej. "SIN-00042") y selecciona el contexto adecuado.
"""

import os
import re
import time
from google import genai
from google.genai import types

from .ia_prompts import SYSTEM_PROMPT, TEMPLATE_MENSAJE_USUARIO
from .context_builder import build_context_global, build_context_siniestro

# ── Cliente Gemini (singleton) ────────────────────────────────────────────────
_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

_MODELO        = "gemini-2.5-flash"
_MAX_TOKENS    = 3000
_TEMPERATURE   = 0.3   # bajo → respuestas factuales y consistentes
_MAX_TURNOS    = 10    # turnos en memoria (20 mensajes)


# ── Helper: detectar ID en texto libre ───────────────────────────────────────

def _detectar_id_siniestro(texto: str) -> str | None:
    """
    Extrae el primer id_siniestro mencionado en la pregunta.
    Acepta: SIN-00042, SIN00042, sin-42, sin42 (normaliza a SIN-NNNNN).
    """
    match = re.search(r'\bSIN[-]?(\d+)\b', texto, re.IGNORECASE)
    if match:
        numero = match.group(1).zfill(5)
        return f"SIN-{numero}"
    return None


# ── Agente ────────────────────────────────────────────────────────────────────

class ClaimsAgent:
    """
    Agente conversacional con memoria de sesión.

    Uso:
        agent.ask("¿Qué proveedores concentran más alertas?")
        agent.ask("¿Por qué SIN-00042 es rojo?")
        agent.ask("¿Y qué documentos le faltan?", id_siniestro="SIN-00042")
        agent.limpiar_historial()
    """

    def __init__(self):
        self._historial: list[dict] = []

    # ── Método principal ──────────────────────────────────────────────────────

    def ask(self, pregunta: str, id_siniestro: str | None = None) -> str:
        """
        Procesa una pregunta del analista y retorna la respuesta de Gemini.

        El contexto se selecciona así:
          1. Si se pasa id_siniestro explícito → contexto de ese siniestro.
          2. Si la pregunta menciona un SIN-XXXXX → contexto de ese siniestro.
          3. Si no → contexto global (estadísticas de toda la BD).
        """
        # 1. Seleccionar contexto
        id_detectado = id_siniestro or _detectar_id_siniestro(pregunta)

        if id_detectado:
            contexto       = build_context_siniestro(id_detectado)
            tipo_consulta  = f"siniestro específico ({id_detectado})"
        else:
            contexto       = build_context_global()
            tipo_consulta  = "base de datos completa"

        # 2. Armar mensaje con contexto embebido
        mensaje = TEMPLATE_MENSAJE_USUARIO.format(
            tipo_consulta = tipo_consulta,
            contexto      = contexto,
            pregunta      = pregunta,
        )

        # 3. Añadir al historial y llamar a Gemini
        self._historial.append({
            "role":  "user",
            "parts": [{"text": mensaje}],
        })

        respuesta = self._llamar_gemini()

        # 4. Guardar respuesta en historial
        self._historial.append({
            "role":  "model",
            "parts": [{"text": respuesta}],
        })

        # 5. Mantener ventana de memoria
        if len(self._historial) > _MAX_TURNOS * 2:
            self._historial = self._historial[-(_MAX_TURNOS * 2):]

        return respuesta

    # ── Gemini ────────────────────────────────────────────────────────────────

    def _llamar_gemini(self) -> str:
        intentos = 3
        for intento in range(intentos):
            try:
                contents = [
                    types.Content(
                        role  = m["role"],
                        parts = [types.Part(text=m["parts"][0]["text"])],
                    )
                    for m in self._historial
                ]
                response = _client.models.generate_content(
                    model    = _MODELO,
                    config   = types.GenerateContentConfig(
                        system_instruction = SYSTEM_PROMPT,
                        max_output_tokens  = _MAX_TOKENS,
                        temperature        = _TEMPERATURE,
                    ),
                    contents = contents,
                )
                return response.text

            except Exception as e:
                error_str = str(e)
                if '503' in error_str and intento < intentos - 1:
                    espera = (intento + 1) * 5  # 5s, 10s
                    print(f"[claims_agent] Gemini 503, reintentando en {espera}s... (intento {intento+1}/{intentos})")
                    time.sleep(espera)
                    continue
                print(f"[claims_agent] Error Gemini: {e}")
                return (
                    "El modelo de IA está experimentando alta demanda en este momento. "
                    "Por favor intenta nuevamente en unos minutos."
                )

    # ── Gestión de historial ──────────────────────────────────────────────────

    def limpiar_historial(self) -> None:
        """Reinicia la conversación. Llamar entre sesiones de analistas distintos."""
        self._historial = []

    @property
    def turnos_en_memoria(self) -> int:
        return len(self._historial) // 2

    def resumen_historial(self) -> list[dict]:
        """Útil para debug — retorna previews de cada mensaje."""
        return [
            {
                "rol":     m["role"],
                "preview": m["parts"][0]["text"][:120] + "...",
            }
            for m in self._historial
        ]


# ── Instancia global ──────────────────────────────────────────────────────────
agent = ClaimsAgent()