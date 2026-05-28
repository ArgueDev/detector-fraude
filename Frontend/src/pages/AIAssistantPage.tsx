import PageHeader from "../components/layout/PageHeader";
import ChatContainer from "../components/chat/ChatContainer";

export default function AIAssistantPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="FRAUDIA IA"
        title="Asistente inteligente"
        description="Consulta patrones de fraude, scores de riesgo y análisis de casos en lenguaje natural."
      />
      <ChatContainer />
    </div>
  );
}
