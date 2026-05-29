export type ChatRequest = {
  summary: string;
  value: {
    pregunta: string;
  };
};

export type ChatResponse = string;

export type ChatUiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};
