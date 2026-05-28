# Reto HackIAthon - Sistema de Soporte a Decisiones

## Descripción
Este repositorio contiene la implementación de un **sistema de soporte a decisiones** para el **Reto Aseguradora del Sur**. El objetivo es crear un prototipo funcional basado en IA que genere alertas explicables y puntuaciones de riesgo para siniestros de seguros.

## Características principales
- Ingesta y procesamiento de datos de siniestros, pólizas, asegurados, proveedores y documentos.
- Cálculo de score de riesgo (0‑100) y clasificación en semáforo (verde, amarillo, rojo).
- Motor híbrido de reglas y modelos de machine‑learning / detección de anomalías.
- Análisis de similitud de textos (NLP) para detectar descripciones clonadas.
- Agente conversacional explicativo basado en LLMs.
- Integración con Notion para visualización y seguimiento de casos.

## Estructura del proyecto
```
Reto-HackIAthon/
├─ src/
│  ├─ ingestion/        # Carga y validación de datos
│  ├─ features/          # Ingeniería de variables
│  ├─ rules/             # Motor de reglas determinísticas
│  ├─ models/            # Modelos ML / anomalías
│  ├─ explainability/   # Generación de explicaciones
│  ├─ ai_agent/          # Agente LLM para interacción
│  └─ app/
│      └─ main.py        # API FastAPI
├─ tests/                # Tests unitarios
├─ .env.example          # Variables de entorno (Notion token, DB ID)
├─ requirements.txt      # Dependencias Python
└─ README.md
```

## Instalación
```bash
# Clonar repo
git clone <repo_url>
cd Reto-HackIAthon

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## Uso rápido
1. Definir variables en `.env` (ver `.env.example`).
2. Ejecutar API:
```bash
uvicorn src.app.main:app --reload
```
3. Acceder al frontend (pendiente de desarrollo) o usar los endpoints directamente.

## Licencia
MIT
