import os
import google.generativeai as genai
from ..core.config import GEMINI_API_KEY

def get_gemini_response(prompt: str) -> str:
    """Instancia el modelo Gemini‑2.5‑flash y devuelve la respuesta del LLM.
    Se inicializa la clave API solo una vez.
    """
    # Configurar la clave de API
    if not genai._client:  # simple check; si no está configurado lo inicializamos
        genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    try:
        response = model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.1))
        # El texto está en response.text o en parts[0].text
        if hasattr(response, 'text'):
            return response.text
        # fallback to parts
        if response.candidates and response.candidates[0].content.parts:
            return response.candidates[0].content.parts[0].text
        return "Respuesta vacía del modelo"
    except Exception as e:
        return f"Error al llamar a Gemini: {e}"
