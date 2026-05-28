export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "¿Cuál es el caso con mayor score de riesgo actualmente?",
    timestamp: "10:24",
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "El caso con mayor score es **SIN-00003** con un puntaje de **94/100** (nivel Rojo). Está asociado a reclamo por robo en ramo Vida, sucursal Cuenca, con monto reclamado de $5,992.75. Las alertas activas incluyen documentación duplicada y proveedor en lista de observación.",
    timestamp: "10:24",
  },
  {
    id: "msg-3",
    role: "user",
    content: "Explica el riesgo del SIN-00003",
    timestamp: "10:26",
  },
  {
    id: "msg-4",
    role: "assistant",
    content:
      "El riesgo del SIN-00003 se eleva por cuatro factores convergentes:\n\n1. **Documentación**: facturas con números de serie duplicados\n2. **Proveedor**: taller con 3 alertas en 6 meses\n3. **Monto**: 2.4× el promedio del ramo Vida/Robo\n4. **Temporal**: reporte fuera del rango habitual\n\nRecomendación: suspender pago y activar auditoría forense.",
    timestamp: "10:26",
  },
  {
    id: "msg-5",
    role: "user",
    content: "¿Qué proveedores tienen más alertas?",
    timestamp: "10:28",
  },
];

export const suggestedQuestions = [
  "¿Qué proveedores tienen más alertas?",
  "¿Qué patrones sospechosos existen?",
  "¿Cuál es el caso con mayor score?",
  "Explica el riesgo del SIN-00003",
];

export const mockAssistantReply =
  "Según el análisis de FRAUDIA, los proveedores con más alertas son **Taller AutoExpress** (12), **Clínica San Rafael** (9) y **Repuestos del Sur** (7). Te recomiendo revisar el informe de proveedores en la sección Reportes.";
