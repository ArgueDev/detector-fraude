# 🛡️ ClaimGuard AI - Detector de Posibles Fraudes en Siniestros

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Pro-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://deepmind.google/technologies/gemini/)

Este repositorio contiene la implementación del proyecto **ClaimGuard AI** para el **hackIAthon 2026**. 

Un sistema avanzado de soporte a decisiones diseñado para el sector asegurador. La solución emplea un motor híbrido de reglas de negocio e Inteligencia Artificial Generativa para analizar siniestros, detectar anomalías, generar scores de riesgo y proveer explicaciones en lenguaje natural para los analistas.

> ⚠️ **PRINCIPIO CLAVE:** Esta solución genera **alertas de revisión**, no acusaciones automáticas de fraude. El sistema está diseñado como un "Copiloto" (Agente de IA) que asiste al analista humano mediante la priorización de casos sospechosos y la explicabilidad del riesgo.

---

## 🚀 Características Principales

Cumplimos y superamos el alcance del reto, llevando el prototipo a un Nivel Excepcional (5) según la Matriz de Evaluación:

- **Motor de Reglas y Score (0-100):** Cálculo dinámico de variables de riesgo (RF-01 a RF-07) con semáforo de priorización: 🟢 Verde (Bajo), 🟡 Amarillo (Medio), 🔴 Rojo (Alto).
- **Agente Explicativo Conversacional:** Un Chatbot potenciado por LLM (Google Gemini) capaz de responder preguntas analíticas ("¿Cuáles son los 10 siniestros con mayor riesgo?", "¿Qué proveedores concentran más alertas?") y explicar el porqué del riesgo de un siniestro específico.
- **Análisis de Anomalías y Relaciones:** Detección de frecuencias atípicas, montos que exceden promedios y proveedores recurrentes en casos observados.
- **Arquitectura Escalable y Desplegada:** Backend en FastAPI y PostgreSQL, Frontend en React, completamente desacoplado y deplegado en la nube (Render).
- **Seguridad y Ética:** Uso estricto de datos sintéticos generados, sin exposición de PII ni credenciales en el código fuente.

---

## 🏗️ Arquitectura del Sistema

La solución se compone de un Frontend moderno y un Backend modular orientado a APIs:

```text
Detector-Fraude/
├── Backend/                 # API RESTful en Python (FastAPI)
│   ├── app/                 
│   │   ├── ai_agent/        # Orquestación de IA y Context Builder
│   │   ├── api/             # Endpoints (Siniestros, Estadísticas, Chat)
│   │   ├── core/            # Configuración y Motor de Reglas (fraud_rules)
│   │   └── model/           # Modelos de base de datos (SQLAlchemy)
│   ├── tests/               # Pruebas automatizadas (pytest)
│   ├── data/                # Datasets sintéticos
│   └── seed_db.py           # Script para poblar la DB sintética
└── Frontend/                # Aplicación Web (React) - Interfaz del Analista
```

---

## 🧠 Enfoque Híbrido de Inteligencia Artificial

Para maximizar la **Explicabilidad y Trazabilidad**, el sistema no depende de una "caja negra". Utilizamos:

1. **Evaluación Determinística:** El módulo `fraud_rules.py` ejecuta cruces de datos duros (ej. Siniestro a < 48hrs del inicio de póliza, documentos inconsistentes, montos > 85% de suma asegurada).
2. **Generación Aumentada por Recuperación (RAG) / Context Builder:** Nuestro módulo `context_builder.py` inyecta las estadísticas en tiempo real y el detalle de los siniestros como contexto dinámico para el LLM.
3. **Agente LLM:** Interpreta el contexto, resume los factores de riesgo y permite al analista interactuar ("Consulta Agentica") sobre los datos consolidados.

---

## 🚦 Score de Riesgo (Semáforo)

El sistema clasifica los siniestros de la siguiente manera:

| Rango | Nivel | Acción sugerida por el Agente |
|-------|-------|-------------------------------|
| **0 - 40** | 🟢 Verde Bajo | Continuar flujo normal de liquidación. |
| **41 - 75** | 🟡 Amarillo Medio | Escalar a Unidad Antifraude para Revisión documental exhaustiva. |
| **76 - 100** | 🔴 Rojo Alto | Escalar a Unidad Antifraude para Revisión especializada de campo. |

---

## 💻 Guía de Instalación y Uso (Local)

### Requisitos
- Python 3.10+
- PostgreSQL
- Node.js (Para el Frontend)

### 1. Configuración del Backend

```bash
cd Backend

# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.template .env
# Edita el archivo .env con tus credenciales de BD y tu API Key de Gemini
```

### 2. Base de Datos y Seed de Datos Sintéticos

```bash
# Inicializar las tablas y cargar el dataset sintético
python seed_db.py
```

### 3. Ejecutar la API

```bash
uvicorn app.main:app --reload --port 8000
```
La documentación interactiva de la API estará disponible en: `http://localhost:8000/docs`

---

## 📊 Endpoints Clave (API)

- `POST /api/v1/siniestros/recalcular-todos`: Ingesta y recálculo masivo del score de riesgo en toda la base de datos.
- `GET /api/v1/estadisticas/top-riesgo`: Obtiene los siniestros priorizados.
- `GET /api/v1/estadisticas/resumen-ejecutivo`: Genera los KPIs clave (Ramos sospechosos, ciudades, montos atípicos).
- `POST /api/v1/chat/`: Endpoint interactivo con la IA. Envía consultas en lenguaje natural como `"¿Qué proveedores tienen más alertas?"`.

---

## 🏆 Criterios de Evaluación Cubiertos

* **Entendimiento del problema:** Abordaje enfocado en asistir al analista, con reglas precisas (frecuencia, fechas, red de proveedores).
* **Calidad del prototipo:** Aplicación completa (Fullstack), con dashboard visual y ejecución rápida.
* **Uso efectivo de IA:** Integración de un agente explicativo real que no alucina, basado en el contexto exacto de los datos.
* **Explicabilidad y trazabilidad:** El score rojo/amarillo siempre detalla qué regla técnica (`RF-0X`) se activó.
* **Calidad técnica:** Código modular en FastAPI, buenas prácticas, tipado fuerte y pruebas unitarias (`pytest`).
* **Privacidad y Ética:** Uso de Fake Data (Sintética) y protección del principio de presunción de inocencia del cliente.

---

## ⚠️ Limitaciones
- La API pública tiene límite de 100 peticiones por minuto.
- Los datos son sintéticos; no representan casos reales.
- El modelo LLM puede generar respuestas no verificadas; siempre validar con analista.

**Desarrollado para el HackIAthon Aseguradora del Sur 2026**
**@Ctrl + Alt + IA**
