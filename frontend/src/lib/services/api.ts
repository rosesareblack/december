// Browser-based API service - replaces backend API calls
import * as aiService from "./ai";
import * as fileSystem from "./fileSystem";
import * as containerService from "./container";
import * as exportService from "./export";

export interface Container {
  id: string;
  name: string;
  status: string;
  created: string;
  url: string | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: aiService.Attachment[];
}

export interface Attachment {
  type: "image" | "document";
  data: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface CreateContainerResponse {
  containerId: string;
  container: {
    id: string;
    containerId: string;
    status: string;
    url: string;
    createdAt: string;
    type: string;
  };
}

// Container/Project Management
export async function getContainers(): Promise<Container[]> {
  const projects = containerService.getProjects();
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    status: project.status === "active" ? "running" : "stopped",
    created: project.created,
    url: project.status === "active" ? `#/preview/${project.id}` : null,
  }));
}

export async function createContainer(): Promise<CreateContainerResponse> {
  const project = containerService.createProject();
  
  // Initialize with default files
  await containerService.initializeProjectFiles(project.id);
  
  return {
    containerId: project.id,
    container: {
      id: project.id,
      containerId: project.id,
      status: "running",
      url: `#/preview/${project.id}`,
      createdAt: project.created,
      type: "Next.js App",
    },
  };
}

export async function startContainer(containerId: string): Promise<{ containerId: string; status: string }> {
  containerService.updateProject(containerId, { status: "active" });
  return {
    containerId,
    status: "running",
  };
}

export async function stopContainer(containerId: string): Promise<{ containerId: string; status: string }> {
  containerService.updateProject(containerId, { status: "inactive" });
  return {
    containerId,
    status: "stopped",
  };
}

export async function deleteContainer(containerId: string): Promise<{ containerId: string }> {
  containerService.deleteProject(containerId);
  await fileSystem.clearProject(containerId);
  return { containerId };
}

// File Management
export async function getFileTree(containerId: string): Promise<fileSystem.FileItem[]> {
  return await fileSystem.getFileTree(containerId);
}

export async function getFileContentTree(containerId: string): Promise<fileSystem.FileContentItem[]> {
  return await fileSystem.getFileContentTree(containerId);
}

export async function readFile(containerId: string, path: string): Promise<string> {
  const content = await fileSystem.getFile(containerId, path);
  if (content === null) {
    throw new Error(`File not found: ${path}`);
  }
  return content;
}

export async function writeFile(containerId: string, path: string, content: string): Promise<void> {
  await fileSystem.writeFile(containerId, path, content);
  containerService.updateProject(containerId, { lastModified: new Date().toISOString() });
}

export async function renameFile(containerId: string, oldPath: string, newPath: string): Promise<void> {
  await fileSystem.renameFile(containerId, oldPath, newPath);
  containerService.updateProject(containerId, { lastModified: new Date().toISOString() });
}

export async function deleteFile(containerId: string, path: string): Promise<void> {
  await fileSystem.deleteFile(containerId, path);
  containerService.updateProject(containerId, { lastModified: new Date().toISOString() });
}

// Chat/AI Management
const SYSTEM_PROMPT = `You are December, an AI editor that creates and modifies web applications. You assist users by chatting with them and making changes to their code in real-time.

You follow these key principles:
1. Code Quality and Organization:
   - Create small, focused components (< 50 lines)
   - Use TypeScript for type safety
   - Follow established project structure
   - Implement responsive designs by default

2. Next.js Guidelines:
   - Use server components by default
   - Implement client components only when necessary (with "use client" directive)
   - Utilize the file-based routing system
   - Use src directory structure (src/app)

3. Always provide clear, concise explanations and ensure all code changes are fully functional.`;

export async function sendChatMessage(
  containerId: string,
  message: string,
  attachments?: Attachment[]
): Promise<{ success: boolean; userMessage: Message; assistantMessage: Message }> {
  // Get current codebase context
  const fileTree = await getFileContentTree(containerId);
  const codeContext = JSON.stringify(fileTree, null, 2);

  const result = await aiService.sendMessage(
    containerId,
    message,
    codeContext,
    SYSTEM_PROMPT,
    attachments
  );

  return {
    success: true,
    userMessage: result.userMessage,
    assistantMessage: result.assistantMessage,
  };
}

export function sendChatMessageStream(
  containerId: string,
  message: string,
  attachments: Attachment[] = [],
  onMessage: (data: any) => void,
  onError?: (error: string) => void,
  onComplete?: () => void
): () => void {
  let cancelled = false;

  (async () => {
    try {
      // Get current codebase context
      const fileTree = await getFileContentTree(containerId);
      const codeContext = JSON.stringify(fileTree, null, 2);

      const stream = aiService.sendMessageStream(
        containerId,
        message,
        codeContext,
        SYSTEM_PROMPT,
        attachments
      );

      for await (const chunk of stream) {
        if (cancelled) break;
        onMessage(chunk);
      }

      if (!cancelled) {
        onComplete?.();
      }
    } catch (error) {
      if (!cancelled) {
        onError?.(error instanceof Error ? error.message : "Stream error");
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}

export async function getChatHistory(containerId: string): Promise<{
  success: boolean;
  messages: Message[];
  sessionId: string;
}> {
  const messages = aiService.getChatHistory(containerId);
  return {
    success: true,
    messages,
    sessionId: `${containerId}-session`,
  };
}

// Export functionality
export async function exportProjectAsZip(containerId: string): Promise<void> {
  const project = containerService.getProject(containerId);
  await exportService.downloadProjectAsZip(containerId, project?.name);
}
