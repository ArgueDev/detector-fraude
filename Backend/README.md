# Detector de Fraudes — Backend

API y motor de análisis antifraude para **Aseguradora del Sur**, desarrollado como solución del reto técnico (secciones 6–13 del PDF del hackathon). El sistema combina **reglas de negocio**, **Machine Learning** y un **agente conversacional (ARIA)** con Gemini, siempre bajo el principio de emitir **alertas de revisión**, nunca veredictos de fraude.

---

## Tabla de contenidos

1. [Resumen del sistema](#resumen-del-sistema)
2. [Stack tecnológico](#stack-tecnológico)
3. [Arquitectura](#arquitectura)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Modelo de datos](#modelo-de-datos)
6. [Motor de scoring híbrido](#motor-de-scoring-híbrido)
7. [Reglas de negocio](#reglas-de-negocio)
8. [Modelo de Machine Learning](#modelo-de-machine-learning)
9. [Agente conversacional ARIA](#agente-conversacional-aria)
10. [Explicabilidad con Gemini](#explicabilidad-con-gemini)
11. [API REST — referencia de endpoints](#api-rest--referencia-de-endpoints)
12. [Variables de entorno](#variables-de-entorno)
13. [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
14. [Datos sintéticos y carga en BD](#datos-sintéticos-y-carga-en-bd)
15. [Entrenamiento del modelo ML](#entrenamiento-del-modelo-ml)
16. [Pruebas](#pruebas)
17. [Principios éticos y de seguridad](#principios-éticos-y-de-seguridad)
18. [Solución de problemas](#solución-de-problemas)

---

## Resumen del sistema

| Componente | Descripción |
|------------|-------------|
| **Dataset sintético** | CSVs con señales de fraude simuladas (borde de vigencia, demora en robo, listas restrictivas, documentos inconsistentes, etc.) |
| **PostgreSQL** | Persistencia de asegurados, pólizas, siniestros, proveedores y documentos |
| **Motor de reglas** | Puntaje 0–100 + alertas textuales + reglas críticas RF-01 a RF-07 |
| **Random Forest** | Probabilidad de fraude simulado (0.0–1.0) a partir de features tabulares |
| **Score final** | `60 % reglas + 40 % ML` → nivel **Verde / Amarillo / Rojo** |
| **Dashboard API** | Endpoints de estadísticas agregadas para el frontend y el agente |
| **ARIA** | Agente Gemini 2.5 Flash con contexto inyectado desde la propia API |
| **Explain score** | Informe ejecutivo opcional por siniestro vía `?con_explicacion=true` |

---

## Stack tecnológico

| Capa | Tecnología | Uso en el proyecto |
|------|------------|-------------------|
| API | **FastAPI** 0.136 | Rutas REST, validación Pydantic, OpenAPI en `/docs` |
| Servidor | **Uvicorn** 0.48 | ASGI en desarrollo y producción |
| ORM | **SQLAlchemy** 2.0 | Modelos y consultas a PostgreSQL |
| BD | **PostgreSQL** + **psycopg2-binary** | Base en Render (o local) |
| Datos | **pandas**, **numpy** | Seed, features ML, estadísticas |
| ML | **scikit-learn**, **joblib** | Random Forest entrenado y serializado |
| Dataset | **Faker** | Generación de datos sintéticos en español (ES) |
| IA | **google-genai** 2.5 flash | Cliente oficial Gemini (`gemini-2.5-flash`) |
| HTTP interno | **httpx** | `context_builder` consume la API local |
| Config | **python-dotenv** | Variables `DATABASE_URL`, `GEMINI_API_KEY` |
| Tests | **pytest**, **httpx** | Unitarias y smoke tests de endpoints |

Dependencias completas: [`requirements.txt`](requirements.txt).  
Opcionales (notebooks, gráficos): [`requirements-dev.txt`](requirements-dev.txt).

---

## Arquitectura

```mermaid
flowchart TB
    subgraph Clientes
        FE[Frontend React]
        ANAL[Analista / Swagger]
    end

    subgraph API["FastAPI — app/main.py"]
        SIN["/api/v1/siniestros"]
        EST["/api/v1/estadisticas"]
        PROV["/api/v1/proveedores"]
        CHAT["/api/v1/chat"]
    end

    subgraph Motor
        RULES[fraud_rules.py]
        ML[fraud_predictor.py]
        RF[(Random Forest .joblib)]
    end

    subgraph IA
        ARIA[claims_agent.py]
        CTX[context_builder.py]
        EXP[explain_score.py]
        GEMINI[Google Gemini API]
    end

  DB[(PostgreSQL)]

    FE --> API
    ANAL --> API
    SIN --> RULES
    SIN --> ML
    ML --> RF
    RULES --> DB
    ML --> DB
    EST --> DB
    PROV --> DB
    CHAT --> ARIA
    ARIA --> CTX
    CTX -->|httpx GET| EST
    ARIA --> GEMINI
    SIN -->|con_explicacion| EXP
    EXP --> GEMINI
    API --> DB
```

**Flujo al calcular score de un siniestro** (`POST /siniestros/{id}/calcular-score`):

1. Cargar siniestro, póliza y asegurado desde PostgreSQL.
2. `evaluar_reglas()` → `score_reglas`, lista de alertas, `nivel_critico` opcional.
3. `predecir_fraude()` → `score_ml` (probabilidad 0–1).
4. `calcular_score_final()` → score entero 0–100 y nivel base.
5. **Override** si hay regla crítica Rojo (≥76) o Amarillo (≥41).
6. Persistir `score_riesgo`, `nivel_riesgo`, `alertas_activadas` (JSON).
7. Opcional: `explainer.explain_case()` con Gemini.

---

## Estructura del proyecto

```
Backend/
├── .env                    # Credenciales (NO versionar)
├── .env.template           # Plantilla de variables
├── requirements.txt        # Dependencias de producción + tests
├── requirements-dev.txt    # Jupyter, matplotlib (opcional)
├── init_db.py              # Crea tablas en PostgreSQL
├── seed_db.py              # Carga CSVs → BD
├── test_endpointsEstadistico.py   # Smoke tests HTTP (manual/CI)
│
├── data/
│   ├── generar_dataset.py  # Genera CSVs sintéticos
│   └── synthetic/          # asegurados, polizas, siniestros, proveedores, documentos
│
├── notebooks/
│   ├── 02_modelo_fraude.ipynb
│   └── train_model.py      # Script equivalente al notebook
│
├── tests/
│   ├── conftest.py         # SQLite en memoria + TestClient
│   └── test_rules.py       # Pruebas de reglas (pendiente alinear con evaluar_reglas)
│
└── app/
    ├── main.py             # FastAPI + CORS + routers
    ├── core/
    │   ├── config.py       # DATABASE_URL, GEMINI_API_KEY
    │   ├── database.py     # Engine, SessionLocal, get_db
    │   ├── fraud_rules.py  # Motor de reglas RF + señales
    │   └── fraud_predictor.py  # Carga ML y score combinado
    ├── model/              # ORM SQLAlchemy
    │   ├── ModeloEntrenado/    # Artefactos .joblib (versionar o regenerar)
    │   │   ├── random_forest_fraud.joblib
    │   │   ├── model_features.joblib
    │   │   ├── le_ramo.joblib
    │   │   └── le_cobertura.joblib
    │   ├── siniestro.py, poliza.py, asegurado.py, proveedor.py, documento.py
    ├── api/routes/
    │   ├── siniestros.py
    │   ├── estadisticas.py
    │   ├── proveedores.py
    │   └── chat.py
    ├── ai_agent/
    │   ├── claims_agent.py     # ARIA + historial + Gemini
    │   ├── context_builder.py  # Arma contexto desde endpoints
    │   └── ia_prompts.py       # System prompt y plantillas
    ├── explainability/
    │   └── explain_score.py    # Informe ejecutivo por caso
    └── ai/
        └── gemini_client.py    # Legacy (SDK antiguo); no usado en rutas activas
```

---

## Modelo de datos

Cinco tablas principales. El campo más relevante para el reto es **`siniestro`**, que el motor actualiza tras cada análisis.

### `siniestro` (campos clave)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_siniestro` | string | Ej. `SIN-00001` |
| `id_poliza`, `id_asegurado` | FK | Relaciones |
| `ramo`, `cobertura` | string | Vehículos, Salud, Robo, etc. |
| `monto_reclamado` | float | Monto solicitado |
| `dias_desde_inicio_poliza`, `dias_desde_fin_poliza` | int | Señal borde de vigencia |
| `dias_entre_ocurrencia_reporte` | int | Demora en denuncia |
| `documentos_completos` | bool | RF documentación |
| `beneficiario` | string | ID proveedor (`PROV-XXX`) |
| **`score_riesgo`** | int 0–100 | Calculado por el motor |
| **`nivel_riesgo`** | string | `'Verde'`, `'Amarillo'`, `'Rojo'` (capitalización exacta) |
| **`alertas_activadas`** | text JSON | Lista de strings con motivos |
| `etiqueta_fraude_simulada` | 0/1 | Solo para entrenar/evaluar ML |

### Umbrales de nivel (PDF del reto)

| Score | Nivel |
|-------|-------|
| 0 – 40 | Verde |
| 41 – 75 | Amarillo |
| 76 – 100 | Rojo |

### Volumen típico tras `seed_db.py`

| Tabla | Registros aprox. |
|-------|------------------|
| Siniestros | 1 000 |
| Pólizas | 500 |
| Asegurados | 300 |
| Proveedores | 60 |
| Documentos | ~1 700 |
| Fraudes simulados (`etiqueta_fraude_simulada=1`) | ~20 % |

---

## Motor de scoring híbrido

Implementado en `app/api/routes/siniestros.py` → `_calcular_y_guardar_score()`.

```
score_final = clamp( score_reglas * 0.6 + score_ml * 100 * 0.4 , 0, 100 )
```

| Entrada | Origen | Rango |
|---------|--------|-------|
| `score_reglas` | `fraud_rules.evaluar_reglas()` | 0–100 (suma de señales, tope 100) |
| `score_ml` | `fraud_predictor.predecir_fraude()` | 0.0–1.0 (probabilidad Random Forest) |

**Overrides por regla crítica** (después del cálculo base):

- Si `nivel_critico == 'Rojo'` → fuerza `nivel_riesgo = 'Rojo'` y `score_riesgo >= 76`.
- Si `nivel_critico == 'Amarillo'` y el nivel era Verde → fuerza Amarillo y `score >= 41`.

---

## Reglas de negocio

Archivo: `app/core/fraud_rules.py`

### Sección 7 — Señales con puntaje (suman al `score_reglas`)

| Regla | Máx. pts | Condición resumida |
|-------|----------|-------------------|
| Borde de vigencia | 8 | Siniestro ≤10 o ≤30 días del inicio/fin de póliza |
| Demora denuncia robo | 8 | Cobertura robo + demora en horas |
| Frecuencia asegurado | 8 | Historial de siniestros previos |
| Documentos incompletos | 4 | `documentos_completos == false` |
| Reporte tardío | 5 | Días entre ocurrencia y reporte |
| Documentos inconsistentes | 10 | Inconsistencias o ilegibles en BD |
| Proveedor recurrente | 10 | Lista restrictiva o muchos reclamos |
| Monto atípico | 4 | Reclamado ≥ 95 % de suma asegurada |

### Sección 8 — Reglas críticas RF (elevan nivel mínimo)

| Código | Nivel mínimo | Descripción |
|--------|--------------|-------------|
| RF-01 | Rojo | Robo / pérdida total con monto elevado |
| RF-02 | Rojo | Posible adulteración documental |
| RF-03 | Rojo | Proveedor en lista restrictiva (≥50 % casos observados) |
| RF-05 | Amarillo | Borde de vigencia &lt; 48 h |
| RF-06 | Amarillo | Demora atípica en denuncia de robo (&gt;4 días) |
| RF-07 | Amarillo | Narrativa idéntica en otro siniestro |

Las alertas se guardan como JSON en `alertas_activadas`.

---

## Modelo de Machine Learning

| Aspecto | Detalle |
|---------|---------|
| Algoritmo | **RandomForestClassifier** (scikit-learn) |
| Entrenamiento | `notebooks/02_modelo_fraude.ipynb` o `notebooks/train_model.py` |
| Artefactos | `app/model/ModeloEntrenado/*.joblib` |
| Inferencia | `app/core/fraud_predictor.py` (carga al importar el módulo) |
| Features | Montos, ratios, bordes de vigencia, categóricas codificadas (`le_ramo`, `le_cobertura`), datos de asegurado y póliza |
| Etiqueta | `etiqueta_fraude_simulada` en el dataset |

> **Importante:** Si borras `ModeloEntrenado/`, debes volver a entrenar antes de levantar la API; `fraud_predictor` carga los `.joblib` al iniciar.

---

## Agente conversacional ARIA

| Archivo | Rol |
|---------|-----|
| `claims_agent.py` | Clase `ClaimsAgent`, historial (10 turnos), llamadas a Gemini |
| `context_builder.py` | GET internos a `/api/v1/estadisticas/*` y detalle de siniestro |
| `ia_prompts.py` | `SYSTEM_PROMPT`, reglas éticas, plantillas de contexto |
| `chat.py` | Endpoints HTTP que delegan en `agent` |

**Modelo:** `gemini-2.5-flash` — temperatura `0.3`, máx. 3000 tokens.

**Selección de contexto:**

1. Si el body trae `id_siniestro` → contexto del caso.
2. Si la pregunta menciona `SIN-00042` (regex flexible) → mismo caso.
3. Si no → contexto global (resumen ejecutivo, proveedores, ramos, ciudades, etc.).

**Preguntas del PDF (sección 12)** cubiertas vía estadísticas inyectadas en el prompt.

---

## Explicabilidad con Gemini

`app/explainability/explain_score.py` — clase `FraudeExplainer`.

- Se invoca con `POST /api/v1/siniestros/{id}/calcular-score?con_explicacion=true`.
- Genera informe en Markdown para el analista.
- Si Gemini falla, devuelve un **fallback determinístico** con las alertas ya calculadas.
- Mismo principio ético: “requiere revisión”, nunca “es fraude”.

---

## API REST — referencia de endpoints

Base: `http://localhost:8000`  
Documentación interactiva: [`/docs`](http://localhost:8000/docs)

### Salud

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | `{ "message": "API funcionando", "status": "ok" }` |

### Siniestros — prefijo `/api/v1/siniestros`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listado con filtros `nivel_riesgo`, `ramo`, `limit`, `offset` |
| GET | `/ranking` | Top N por `score_riesgo` (`limit`, default 10) |
| GET | `/{id_siniestro}` | Detalle completo del ORM |
| POST | `/recalcular-todos` | Recalcula todos los siniestros (demo) |
| POST | `/{id_siniestro}/calcular-score` | Reglas + ML + persistencia; `?con_explicacion=true` opcional |

### Estadísticas — prefijo `/api/v1/estadisticas`

| Método | Ruta | Parámetros destacados |
|--------|------|------------------------|
| GET | `/` | Resumen dashboard (totales por nivel, montos) |
| GET | `/top-riesgo` | `limit`, `nivel` |
| GET | `/resumen-ejecutivo` | `top_n` |
| GET | `/proveedores-alertas` | `limit` |
| GET | `/ramos-sospechosos` | — |
| GET | `/ciudades-alertas` | `limit` |
| GET | `/asegurados-frecuentes` | `limit` |
| GET | `/montos-atipicos` | `limit` |
| GET | `/borde-vigencia` | `dias_umbral`, `limit` |
| GET | `/documentos-faltantes` | `solo_criticos` |
| GET | `/patrones-repetidos` | — |

### Proveedores — prefijo `/api/v1/proveedores`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listado completo |
| GET | `/alertas` | Top 20 por `% casos observados` |

### Chat (ARIA) — prefijo `/api/v1/chat`

| Método | Ruta | Body / notas |
|--------|------|----------------|
| POST | `/` | `{ "pregunta": "...", "id_siniestro": "SIN-00001" }` opcional |
| POST | `/limpiar` | Reinicia historial de sesión |
| GET | `/historial` | Debug del historial resumido |

---

## Variables de entorno

Copiar [`.env.template`](.env.template) → `.env`:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | Sí | URL PostgreSQL (`postgresql://user:pass@host/db`) |
| `GEMINI_API_KEY` | Sí | API key de Google AI Studio |
| `INTERNAL_API_URL` | No | Base URL para `context_builder` (default `http://localhost:8000`) |

`app/core/config.py` valida que existan `DATABASE_URL` y `GEMINI_API_KEY` al importar.

---

## Instalación y puesta en marcha

### Requisitos previos

- Python **3.11+**
- PostgreSQL accesible (local o Render)
- API key de **Google Gemini**

### Pasos (Windows PowerShell)

```powershell
cd D:\Otros\Webs\otro\detector-fraude\Backend

# Entorno virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Dependencias
pip install -r requirements.txt

# Variables de entorno
Copy-Item .env.template .env
# Editar .env con DATABASE_URL y GEMINI_API_KEY

# Tablas
python init_db.py

# Datos (primera vez o tras regenerar CSVs)
python seed_db.py

# Calcular scores iniciales (recomendado antes de demo)
# curl -X POST http://localhost:8000/api/v1/siniestros/recalcular-todos

# Servidor
uvicorn app.main:app --reload --port 8000
```

Verificar: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Datos sintéticos y carga en BD

### Generar CSVs

```powershell
python data\generar_dataset.py
```

Produce en `data/synthetic/`:

- `asegurados.csv`, `polizas.csv`, `proveedores.csv`, `siniestros.csv`, `documentos.csv`
- ~20 % de siniestros con `etiqueta_fraude_simulada = 1` y `tipo_fraude_simulado` (borde_vigencia, demora_robo, monto_excesivo, etc.)

### Cargar en PostgreSQL

```powershell
python seed_db.py
```

`seed_db.py` hace `create_all` + `bulk_insert` mapeando solo columnas válidas del ORM.

---

## Entrenamiento del modelo ML

**Opción A — Notebook**

```powershell
pip install -r requirements-dev.txt
jupyter notebook notebooks/02_modelo_fraude.ipynb
```

**Opción B — Script**

```powershell
python notebooks/train_model.py
```

Salida esperada en `app/model/ModeloEntrenado/`:

- `random_forest_fraud.joblib`
- `model_features.joblib`
- `le_ramo.joblib`
- `le_cobertura.joblib`

Reiniciar uvicorn tras regenerar artefactos.

---

## Pruebas

### Smoke test de endpoints (reto PDF)

Con la API en marcha:

```powershell
python test_endpointsEstadistico.py           # 19 endpoints HTTP
python test_endpointsEstadistico.py --chat    # + agente ARIA
python test_endpointsEstadistico.py --recalcular --todo
```

### Pytest

```powershell
pytest tests\ -v
```

`tests/conftest.py` usa SQLite en memoria y `TestClient` de FastAPI.

> **Nota:** `tests/test_rules.py` importa `evaluar_fraude`, que no existe en `fraud_rules.py` (la función actual es `evaluar_reglas`). Alinear o actualizar esos tests antes de usarlos en CI.

---

## Principios éticos y de seguridad

Alineado al PDF y a `ia_prompts.py`:

1. **Nunca** acusar de fraude; usar “alerta”, “requiere revisión”, “señales de riesgo”.
2. Los endpoints y el agente devuelven **alertas de revisión humana**, no decisiones automáticas.
3. ARIA incluye defensas contra prompt injection en el system prompt.
4. El script `test_endpointsEstadistico.py --chat` comprueba respuestas sin lenguaje prohibido.
5. `resumen-ejecutivo` y respuestas estadísticas incluyen notas legales/disclaimer cuando aplica.

---

## Solución de problemas

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| `ValueError: DATABASE_URL no está configurado` | Falta `.env` | Copiar `.env.template` y completar |
| Error al importar `fraud_predictor` | Faltan `.joblib` | Ejecutar `train_model.py` o el notebook |
| Chat sin datos / respuestas vacías | Scores en 0, API caída | `POST /recalcular-todos` y verificar `INTERNAL_API_URL` |
| `borde-vigencia` con 500 histórico | NaN en floats SQL | Ya mitigado con `_clean_for_json` y `JSONResponse` |
| Gemini 401/403 | API key inválida | Revisar `GEMINI_API_KEY` en Google AI Studio |
| `seed_db` duplica datos | Re-ejecutar sin vaciar tablas | Truncar tablas o recrear BD antes de seed |

---

## Licencia y equipo

Proyecto hackathon — **Aseguradora del Sur**.  
Para integración con el frontend, consumir los mismos nombres de campo: `score_riesgo`, `nivel_riesgo`, `alertas_activadas`.
