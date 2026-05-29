# ARIA

**Agente de Revisión Inteligente Antifraude**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154)
![Zod](https://img.shields.io/badge/Zod-4-3E63DD)

Frontend SaaS de **ARIA**: plataforma de análisis antifraude para aseguradoras. Prioriza siniestros por score de riesgo, visualiza métricas en tiempo real, expone explicabilidad IA y permite consultas conversacionales sobre casos, patrones y proveedores.

> Los resultados son **alertas de revisión**, no acusaciones de fraude.

---

## Tabla de contenidos

- [¿Qué es ARIA?](#qué-es-aria)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Flujo del frontend](#flujo-del-frontend)
- [Consumo de APIs](#consumo-de-apis)
- [TanStack Query](#tanstack-query)
- [Validación con Zod](#validación-con-zod)
- [Axios](#axios)
- [Páginas y módulos](#páginas-y-módulos)
- [Chat IA](#chat-ia)
- [Reportes PDF](#reportes-pdf)
- [UI y experiencia](#ui-y-experiencia)
- [Scripts disponibles](#scripts-disponibles)
- [Roadmap](#roadmap)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## ¿Qué es ARIA?

**ARIA** (*Agente de Revisión Inteligente Antifraude*) es la interfaz web del sistema antifraude. Conecta analistas con un backend FastAPI que calcula scores, detecta alertas y genera explicaciones con IA.

| Capacidad | Descripción |
|-----------|-------------|
| 📊 **Dashboard de riesgo** | KPIs, distribución por nivel (Rojo / Amarillo / Verde) y casos prioritarios |
| 🔍 **Casos críticos** | Ranking, filtros, detalle de siniestro, alertas y timeline |
| 🤖 **Chat IA** | Consultas en lenguaje natural vía `POST /chat/` |
| 📄 **Reportes PDF** | Exportación de reportes ejecutivos por siniestro |
| 📈 **Visualización** | Gráficos Recharts con datos reales del backend |
| 🧠 **Explicabilidad** | Tarjeta de análisis IA sobre el caso de mayor riesgo |

---

## Stack tecnológico

| Tecnología | Uso en ARIA |
|------------|-------------|
| **React 19** | UI declarativa y componentes reutilizables |
| **TypeScript 6** | Tipado estricto en toda la aplicación |
| **Vite 8** | Bundler y servidor de desarrollo |
| **TailwindCSS 4** | Estilos utility-first, dark theme |
| **React Router 7** | Navegación SPA con layout compartido |
| **TanStack Query 5** | Cache, loading y mutations async |
| **Axios** | Cliente HTTP con interceptores y timeouts |
| **Zod 4** | Validación runtime de respuestas API |
| **Recharts 3** | Donut, barras, radar y áreas |
| **Iconify** | Iconografía (`@iconify/react`) |
| **jsPDF + autotable** | Generación de PDF en cliente |

---

## Arquitectura

El frontend sigue una arquitectura **modular por capas** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│  Pages (vistas / rutas)                                 │
├─────────────────────────────────────────────────────────┤
│  Components (UI: layout, dashboard, chat, cases, ui)    │
├─────────────────────────────────────────────────────────┤
│  Hooks (TanStack Query: useQuery / useMutation)         │
├─────────────────────────────────────────────────────────┤
│  API Services (axios → endpoints REST)                  │
├─────────────────────────────────────────────────────────┤
│  Schemas (Zod) + Types (TypeScript inferido)            │
├─────────────────────────────────────────────────────────┤
│  Lib (axios, parseApi, mappers, branding, PDF, alertas) │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                   Backend FastAPI :8000
                   /api/v1/*
```

| Capa | Responsabilidad |
|------|-----------------|
| `pages/` | Composición de vistas por ruta |
| `components/` | UI presentacional y de dominio |
| `hooks/` | Estado servidor con TanStack Query |
| `api/` | Llamadas HTTP tipadas |
| `schemas/` | Contratos Zod de request/response |
| `types/` | Tipos derivados de schemas y dominio |
| `lib/` | Utilidades transversales |
| `layouts/` | Shell de aplicación (sidebar + navbar) |
| `router/` | Definición de rutas |
| `mock/` | Datos estáticos de respaldo (preguntas sugeridas, fallbacks) |

---

## Estructura del proyecto

```
Frontend/
├── public/
│   └── icons.svg
├── src/
│   ├── api/                    # Servicios HTTP
│   │   ├── chatApi.ts
│   │   ├── estadisticasApi.ts
│   │   ├── reportesApi.ts
│   │   └── siniestrosApi.ts
│   ├── components/
│   │   ├── cases/              # Detalle, alertas, drawer, PDF
│   │   ├── chat/               # Chat IA (container, input, messages)
│   │   ├── dashboard/          # KPIs, charts, tablas, badges
│   │   ├── layout/             # Sidebar, Navbar, PageHeader
│   │   └── ui/                 # QueryError, skeletons
│   ├── hooks/
│   │   ├── useChatIA.ts
│   │   ├── useDashboardCharts.ts
│   │   ├── useEstadisticas.ts
│   │   ├── useRankingSiniestros.ts
│   │   ├── useReportes.ts
│   │   └── useSiniestro.ts
│   ├── layouts/
│   │   └── DashboardLayout.tsx
│   ├── lib/
│   │   ├── alertas.ts          # parseAlertasActivadas (JSON string)
│   │   ├── axios.ts            # Cliente HTTP + timeouts
│   │   ├── branding.ts         # Constantes ARIA
│   │   ├── generateReportPdf.ts
│   │   ├── parseApi.ts         # safeParse Zod
│   │   ├── queryKeys.ts
│   │   ├── routeMeta.ts
│   │   └── siniestroMappers.ts
│   ├── mock/                   # Fallbacks y datos estáticos
│   ├── pages/
│   │   ├── AIAssistantPage.tsx
│   │   ├── CriticalCasesPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ReportsPage.tsx
│   ├── router/
│   │   └── index.tsx
│   ├── schemas/                # Validación Zod por dominio
│   ├── types/                  # Tipos TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Instalación

### Requisitos

- **Node.js** 18+ (recomendado 20+)
- **pnpm** (recomendado — el proyecto incluye `pnpm-lock.yaml`) o **npm**
- **Backend ARIA** corriendo en `http://localhost:8000`

### Dependencias

```bash
# Con pnpm (recomendado)
pnpm install

# Con npm
npm install
```

Principales dependencias de producción:

| Paquete | Versión (package.json) |
|---------|------------------------|
| `axios` | ^1.16.1 |
| `zod` | ^4.4.3 |
| `@tanstack/react-query` | ^5.100.14 |
| `react-router-dom` | ^7.15.1 |
| `recharts` | ^3.8.1 |
| `@iconify/react` | ^6.0.2 |
| `jspdf` | ^4.2.1 |
| `jspdf-autotable` | ^5.0.8 |

---

## Configuración

Actualmente la URL del backend está definida en `src/lib/axios.ts`:

```typescript
baseURL: "http://localhost:8000/api/v1"
```

No existe archivo `.env` en el repositorio. Para externalizar la configuración, se recomienda crear:

```env
# .env.example (sugerido)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

| Variable sugerida | Descripción | Valor por defecto |
|-------------------|-------------|---------------------|
| `VITE_API_BASE_URL` | Base URL del backend FastAPI | `http://localhost:8000/api/v1` |

### Timeouts HTTP

| Contexto | Duración | Archivo |
|----------|----------|---------|
| API general | 60 s | `src/lib/axios.ts` → `API_TIMEOUT_MS` |
| Chat IA | 120 s | `src/lib/axios.ts` → `CHAT_TIMEOUT_MS` |

---

## Ejecución

### 1. Levantar el backend

Desde la carpeta `Backend/` (ver README del backend):

```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Levantar el frontend

```bash
# Desarrollo
pnpm dev
# o: npm run dev

# Build producción
pnpm build

# Preview del build
pnpm preview

# Lint
pnpm lint
```

| Servicio | URL |
|----------|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (FastAPI) | `http://localhost:8000` |
| Swagger API | `http://localhost:8000/docs` |

---

## Flujo del frontend

```
main.tsx
  └── QueryClientProvider (TanStack Query)
        └── App.tsx
              └── BrowserRouter
                    └── DashboardLayout (Sidebar + Navbar)
                          └── Outlet → Pages
```

### Rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | `DashboardPage` | Centro de control de riesgo |
| `/dashboard` | `DashboardPage` | Alias del dashboard |
| `/casos` | `CriticalCasesPage` | Investigación de casos críticos |
| `/casos?caso=SIN-00001` | `CriticalCasesPage` | Caso preseleccionado |
| `/ia` | `AIAssistantPage` | Chat IA |
| `/ia?caso=SIN-00001` | `AIAssistantPage` | Chat con contexto de caso |
| `/reportes` | `ReportsPage` | Centro de informes y PDF |

---

## Consumo de APIs

Endpoints consumidos por el frontend (prefijo `/api/v1`):

| Método | Endpoint | Hook / Servicio | Uso |
|--------|----------|-----------------|-----|
| `GET` | `/estadisticas/` | `useEstadisticas` | KPIs del dashboard |
| `GET` | `/estadisticas/proveedores-alertas` | `useProveedoresAlertas` | Gráfico top proveedores |
| `GET` | `/estadisticas/patrones-repetidos` | `usePatronesRepetidos` | Radar de patrones |
| `GET` | `/siniestros/ranking?limit=` | `useRankingSiniestros` | Tabla de casos críticos |
| `GET` | `/siniestros/{id}` | `useSiniestro` | Detalle de siniestro |
| `POST` | `/chat/` | `useChatIA` | Consulta IA (texto plano) |

### Flujo de una petición típica

```
Component → Hook (useQuery) → API Service → Axios → Backend
                ↓                              ↓
           loading / error              parseApiResponse(Zod)
                ↓                              ↓
           UI (skeleton / QueryError)    Datos tipados
```

---

## TanStack Query

Configuración global en `src/main.tsx`:

```typescript
staleTime: 30_000        // 30 s
retry: 1
refetchOnWindowFocus: false
```

### Query keys centralizadas

Definidas en `src/lib/queryKeys.ts`:

| Key | Hook |
|-----|------|
| `["estadisticas"]` | `useEstadisticas` |
| `["siniestros", "ranking", limit]` | `useRankingSiniestros` |
| `["siniestros", id]` | `useSiniestro` (con `enabled`) |
| `["reportes"]` | `useReportes` |
| `["estadisticas", "proveedores-alertas", limit]` | `useProveedoresAlertas` |
| `["estadisticas", "patrones-repetidos"]` | `usePatronesRepetidos` |

### Mutations

| Hook | Tipo | Notas |
|------|------|-------|
| `useChatIA` | `useMutation` | `retry: false` — evita doble envío en chat |

---

## Validación con Zod

Toda respuesta del backend pasa por `parseApiResponse()` en `src/lib/parseApi.ts`:

```typescript
const result = schema.safeParse(data);
if (!result.success) throw new Error("Respuesta inválida del servidor");
return result.data;
```

### Schemas por dominio

| Archivo | Valida |
|---------|--------|
| `estadisticas.schema.ts` | Resumen del dashboard |
| `ranking.schema.ts` | Lista ranking de siniestros |
| `siniestro.schema.ts` | Detalle completo de siniestro |
| `alertas.schema.ts` | `alertas_activadas` (string JSON → array) |
| `chat.schema.ts` | Request `{ summary, value }` / Response `string` |
| `patrones.schema.ts` | Patrones repetidos |
| `proveedores.schema.ts` | Proveedores con alertas |
| `reportes.schema.ts` | Resumen de reportes |

### Alertas activadas

El backend envía `alertas_activadas` como **string JSON**. El frontend lo parsea de forma segura en `src/lib/alertas.ts`:

```typescript
// Ejemplo backend: '["RF-02", "Inconsistencia documental"]'
parseAlertasActivadas(raw) // → string[]
```

---

## Axios

Cliente singleton en `src/lib/axios.ts`:

- **Base URL:** `http://localhost:8000/api/v1`
- **Interceptor de errores:** convierte errores HTTP y timeouts en mensajes legibles
- **Timeout chat:** mensaje *"ARIA tardó demasiado en responder. Intenta nuevamente."*

---

## Páginas y módulos

### Dashboard (`DashboardPage`)

- `StatsCards` — métricas generales
- `RiskDonutChart` — distribución de riesgo
- `AIExplanationCard` — explicación del caso top
- `CriticalCasesTable` + `CaseDetailDrawer`
- `TopProvidersChart` / `SuspiciousPatternsChart`

### Casos críticos (`CriticalCasesPage`)

- Ranking con filtros (nivel, sucursal, estado, búsqueda)
- Panel lateral: detalle, alertas, timeline
- `CaseDetailsCard` + `DownloadReportButton`

### Asistente IA (`AIAssistantPage`)

- `ChatContainer` con historial, sugerencias y autoscroll

### Reportes (`ReportsPage`)

- Resumen ejecutivo desde estadísticas
- Tarjetas de informes
- Exportación PDF del caso prioritario

---

## Chat IA

### Request

```json
POST /api/v1/chat/

{
  "summary": "Consulta global",
  "value": {
    "pregunta": "¿Cuáles son los 10 siniestros con mayor riesgo?"
  }
}
```

### Response

Texto plano (`text/plain`) — la respuesta IA es un **string directo**, no un objeto JSON.

### Flujo en el frontend

```
ChatInput → ChatContainer.sendMessage()
  → buildChatRequest() → useChatIA.mutate()
  → chatApi.preguntarIA() [timeout 120s]
  → render bubble con respuesta string
```

| Estado UX | Comportamiento |
|-----------|----------------|
| Loading | Bubble animada, input deshabilitado, autoscroll |
| Error | `QueryError` con botón reintentar |
| Caso en URL | `?caso=SIN-00001` → summary contextual |

---

## Reportes PDF

Generación **100% en cliente** con `jspdf` + `jspdf-autotable`.

| Archivo | Rol |
|---------|-----|
| `src/lib/generateReportPdf.ts` | Lógica de generación |
| `src/components/cases/DownloadReportButton.tsx` | Botón con loading |

**Contenido del PDF:**

- Branding ARIA
- ID siniestro, score, nivel, cobertura, estado
- Fechas, montos, alertas activadas
- Explicación IA
- Tabla resumen
- Timestamp de generación

**Nombre de archivo:** `reporte-siniestro-{ID}.pdf`

**Ubicaciones del botón:** detalle de caso, drawer, página de reportes.

Import dinámico del módulo PDF para optimizar el bundle inicial.

---

## UI y experiencia

Inspiración visual **SaaS / AI enterprise**:

| Característica | Implementación |
|----------------|----------------|
| 🌙 **Dark theme** | Paleta `#0b1120`, `#111827`, acentos rojo ARIA |
| 📱 **Responsive** | Sidebar colapsable, grids adaptativos, tablas scroll |
| ⏳ **Skeleton loading** | `SkeletonCard`, `SkeletonChart`, `SkeletonTable` |
| ⚠️ **Manejo de errores** | `QueryError` con retry — sin `alert()` |
| 🎨 **Branding** | `src/lib/branding.ts` — constantes centralizadas |
| 📊 **Charts** | Recharts con tooltips dark, datos API + fallback mock |

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo Vite |
| `pnpm build` | TypeScript check + build producción |
| `pnpm preview` | Preview del build |
| `pnpm lint` | ESLint |

---

## Roadmap

| Fase | Objetivo |
|------|----------|
| 🔐 v1.1 | Autenticación y roles de analista |
| ⚡ v1.2 | WebSocket para alertas en tiempo real |
| 📊 v1.3 | Analytics avanzados y filtros guardados |
| 📤 v1.4 | Exportaciones CSV/Excel y reportes batch |
| 🔧 v1.5 | Variables de entorno (`VITE_API_BASE_URL`) |

---

## Contribución

1. Fork del repositorio
2. Crear rama: `git checkout -b feature/mi-mejora`
3. Commit: `git commit -m "feat: descripción clara"`
4. Push: `git push origin feature/mi-mejora`
5. Abrir Pull Request hacia `main`

### Convenciones

- TypeScript estricto — sin `any`
- Validar respuestas API con Zod
- Hooks en `src/hooks/`, servicios en `src/api/`
- Componentes reutilizables en `src/components/ui/`
- Mantener branding ARIA y dark theme

---

## Licencia

Proyecto desarrollado para **HackIAthon**. Consultar al equipo propietario para términos de uso y distribución.

---

<p align="center">
  <strong>ARIA v1.0</strong><br/>
  Agente de Revisión Inteligente Antifraude<br/>
  <em>Prioriza riesgos. Explica decisiones. Potencia analistas.</em>
</p>
