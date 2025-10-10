import OpenAI from "openai";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface Attachment {
  type: "image" | "document";
  data: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface ChatSession {
  id: string;
  projectId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Browser-based chat session storage
const chatSessions = new Map<string, ChatSession>();

// AI client configuration
let openaiClient: OpenAI | null = null;

export function initializeAIClient(apiKey: string, baseURL?: string) {
  openaiClient = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL || "https://openrouter.ai/api/v1",
    dangerouslyAllowBrowser: true, // Enable browser-based usage
  });
}

export function getAIClient(): OpenAI {
  if (!openaiClient) {
    // Try to get from environment or localStorage
    const apiKey = 
      process.env.NEXT_PUBLIC_AI_API_KEY || 
      (typeof window !== 'undefined' ? localStorage.getItem('ai_api_key') : null);
    
    const baseURL = 
      process.env.NEXT_PUBLIC_AI_BASE_URL || 
      (typeof window !== 'undefined' ? localStorage.getItem('ai_base_url') : null) || 
      "https://openrouter.ai/api/v1";
    
    if (!apiKey) {
      throw new Error("AI API key not configured. Please set NEXT_PUBLIC_AI_API_KEY or configure it in settings.");
    }
    
    initializeAIClient(apiKey, baseURL);
  }
  
  return openaiClient!;
}

export function getOrCreateChatSession(projectId: string): ChatSession {
  const existingSession = Array.from(chatSessions.values()).find(
    (session) => session.projectId === projectId
  );

  if (existingSession) {
    return existingSession;
  }

  const sessionId = `${projectId}-${Date.now()}`;
  const session: ChatSession = {
    id: sessionId,
    projectId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  chatSessions.set(sessionId, session);
  return session;
}

function buildMessageContent(
  message: string,
  attachments: Attachment[] = []
): any[] {
  const content: any[] = [{ type: "text", text: message }];

  for (const attachment of attachments) {
    if (attachment.type === "image") {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${attachment.mimeType};base64,${attachment.data}`,
        },
      });
    } else if (attachment.type === "document") {
      const decodedText = atob(attachment.data);
      content.push({
        type: "text",
        text: `\n\nDocument "${attachment.name}" content:\n${decodedText}`,
      });
    }
  }

  return content;
}

export async function sendMessage(
  projectId: string,
  userMessage: string,
  codeContext: string,
  systemPrompt: string,
  attachments: Attachment[] = []
): Promise<{ userMessage: Message; assistantMessage: Message }> {
  const client = getAIClient();
  const session = getOrCreateChatSession(projectId);

  const userMsg: Message = {
    id: `user-${Date.now()}`,
    role: "user",
    content: userMessage,
    timestamp: new Date().toISOString(),
    attachments: attachments.length > 0 ? attachments : undefined,
  };

  session.messages.push(userMsg);

  const fullSystemPrompt = `${systemPrompt}

Current codebase structure and content:
${codeContext}`;

  const openaiMessages = [
    { role: "system" as const, content: fullSystemPrompt },
    ...session.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content:
        msg.role === "user" && msg.attachments
          ? buildMessageContent(msg.content, msg.attachments)
          : msg.content,
    })),
  ];

  const model = 
    process.env.NEXT_PUBLIC_AI_MODEL || 
    (typeof window !== 'undefined' ? localStorage.getItem('ai_model') : null) || 
    "anthropic/claude-sonnet-4";

  const completion = await client.chat.completions.create({
    model: model,
    messages: openaiMessages,
    temperature: 0.7,
  });

  const assistantContent =
    completion.choices[0]?.message?.content ||
    "Sorry, I could not generate a response.";

  const assistantMsg: Message = {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: assistantContent,
    timestamp: new Date().toISOString(),
  };

  session.messages.push(assistantMsg);
  session.updatedAt = new Date().toISOString();

  return {
    userMessage: userMsg,
    assistantMessage: assistantMsg,
  };
}

export async function* sendMessageStream(
  projectId: string,
  userMessage: string,
  codeContext: string,
  systemPrompt: string,
  attachments: Attachment[] = []
): AsyncGenerator<{ type: "user" | "assistant" | "done"; data: any }> {
  const client = getAIClient();
  const session = getOrCreateChatSession(projectId);

  const userMsg: Message = {
    id: `user-${Date.now()}`,
    role: "user",
    content: userMessage,
    timestamp: new Date().toISOString(),
    attachments: attachments.length > 0 ? attachments : undefined,
  };

  session.messages.push(userMsg);
  yield { type: "user", data: userMsg };

  const fullSystemPrompt = `${systemPrompt}

Current codebase structure and content:
${codeContext}`;

  const openaiMessages = [
    { role: "system" as const, content: fullSystemPrompt },
    ...session.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content:
        msg.role === "user" && msg.attachments
          ? buildMessageContent(msg.content, msg.attachments)
          : msg.content,
    })),
  ];

  const model = 
    process.env.NEXT_PUBLIC_AI_MODEL || 
    (typeof window !== 'undefined' ? localStorage.getItem('ai_model') : null) || 
    "anthropic/claude-sonnet-4";

  const assistantId = `assistant-${Date.now()}`;
  let assistantContent = "";

  const stream = await client.chat.completions.create({
    model: model,
    messages: openaiMessages,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (delta?.content) {
      assistantContent += delta.content;
      yield {
        type: "assistant",
        data: {
          id: assistantId,
          role: "assistant",
          content: assistantContent,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  const finalAssistantMsg: Message = {
    id: assistantId,
    role: "assistant",
    content: assistantContent,
    timestamp: new Date().toISOString(),
  };

  session.messages.push(finalAssistantMsg);
  session.updatedAt = new Date().toISOString();

  yield { type: "done", data: finalAssistantMsg };
}

export function getChatHistory(projectId: string): Message[] {
  const session = getOrCreateChatSession(projectId);
  return session.messages;
}
