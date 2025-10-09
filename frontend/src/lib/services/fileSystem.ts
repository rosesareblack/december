// Browser-based virtual file system using IndexedDB

export interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileItem[];
  content?: string;
}

export interface FileContentItem {
  name: string;
  path: string;
  type: "file" | "directory";
  content?: string;
  children?: FileContentItem[];
}

const DB_NAME = "DecemberFileSystem";
const DB_VERSION = 1;
const STORE_NAME = "files";

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "path" });
      }
    };
  });
}

// Get a file from IndexedDB
export async function getFile(projectId: string, path: string): Promise<string | null> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const key = `${projectId}:${path}`;

  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.content : null);
    };
    request.onerror = () => reject(request.error);
  });
}

// Write a file to IndexedDB
export async function writeFile(
  projectId: string,
  path: string,
  content: string
): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const key = `${projectId}:${path}`;

  return new Promise((resolve, reject) => {
    const request = store.put({ path: key, content, timestamp: Date.now() });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Delete a file from IndexedDB
export async function deleteFile(projectId: string, path: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const key = `${projectId}:${path}`;

  return new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// List all files for a project
export async function listFiles(projectId: string): Promise<Array<{ path: string; content: string }>> {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.openCursor();
    const files: Array<{ path: string; content: string }> = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const key = cursor.value.path as string;
        if (key.startsWith(`${projectId}:`)) {
          files.push({
            path: key.replace(`${projectId}:`, ""),
            content: cursor.value.content,
          });
        }
        cursor.continue();
      } else {
        resolve(files);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

// Rename a file
export async function renameFile(
  projectId: string,
  oldPath: string,
  newPath: string
): Promise<void> {
  const content = await getFile(projectId, oldPath);
  if (content === null) {
    throw new Error(`File not found: ${oldPath}`);
  }
  await writeFile(projectId, newPath, content);
  await deleteFile(projectId, oldPath);
}

// Get file tree structure
export async function getFileTree(projectId: string): Promise<FileItem[]> {
  const files = await listFiles(projectId);
  const root: FileItem = {
    name: "root",
    path: "/",
    type: "directory",
    children: [],
  };

  const dirMap = new Map<string, FileItem>();
  dirMap.set("/", root);

  // Sort files to process directories first
  files.sort((a, b) => a.path.localeCompare(b.path));

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath || "/";
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (i === parts.length - 1) {
        // It's a file
        const fileItem: FileItem = {
          name: part,
          path: file.path,
          type: "file",
        };

        const parent = dirMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(fileItem);
        }
      } else {
        // It's a directory
        if (!dirMap.has(currentPath)) {
          const dirItem: FileItem = {
            name: part,
            path: currentPath,
            type: "directory",
            children: [],
          };

          const parent = dirMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(dirItem);
          }

          dirMap.set(currentPath, dirItem);
        }
      }
    }
  }

  return root.children || [];
}

// Get file tree with content
export async function getFileContentTree(projectId: string): Promise<FileContentItem[]> {
  const files = await listFiles(projectId);
  const root: FileContentItem = {
    name: "root",
    path: "/",
    type: "directory",
    children: [],
  };

  const dirMap = new Map<string, FileContentItem>();
  dirMap.set("/", root);

  // Sort files to process directories first
  files.sort((a, b) => a.path.localeCompare(b.path));

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath || "/";
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (i === parts.length - 1) {
        // It's a file
        const fileItem: FileContentItem = {
          name: part,
          path: file.path,
          type: "file",
          content: file.content,
        };

        const parent = dirMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(fileItem);
        }
      } else {
        // It's a directory
        if (!dirMap.has(currentPath)) {
          const dirItem: FileContentItem = {
            name: part,
            path: currentPath,
            type: "directory",
            children: [],
          };

          const parent = dirMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(dirItem);
          }

          dirMap.set(currentPath, dirItem);
        }
      }
    }
  }

  return root.children || [];
}

// Clear all files for a project
export async function clearProject(projectId: string): Promise<void> {
  const files = await listFiles(projectId);
  for (const file of files) {
    await deleteFile(projectId, file.path);
  }
}

// Export project as object
export async function exportProject(projectId: string): Promise<Record<string, string>> {
  const files = await listFiles(projectId);
  const project: Record<string, string> = {};
  
  for (const file of files) {
    project[file.path] = file.content;
  }
  
  return project;
}

// Import project from object
export async function importProject(projectId: string, files: Record<string, string>): Promise<void> {
  for (const [path, content] of Object.entries(files)) {
    await writeFile(projectId, path, content);
  }
}
