import JSZip from "jszip";
import { exportProject } from "./fileSystem";

export async function exportProjectAsZip(projectId: string, projectName?: string): Promise<Blob> {
  const files = await exportProject(projectId);
  const zip = new JSZip();

  // Add all files to the zip
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }

  // Generate the zip file
  const blob = await zip.generateAsync({ type: "blob" });
  return blob;
}

export async function downloadProjectAsZip(projectId: string, projectName?: string): Promise<void> {
  const blob = await exportProjectAsZip(projectId, projectName);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName || projectId}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProjectToGitHub(projectId: string, token: string, repoName: string): Promise<void> {
  // This would require implementing GitHub API integration
  // For now, this is a placeholder for future implementation
  throw new Error("GitHub export not yet implemented. Please use ZIP export for now.");
}
