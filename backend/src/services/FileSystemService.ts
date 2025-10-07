import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
  size?: number;
}

export class FileSystemService {
  private workspacePath: string;

  constructor(workspacePath?: string) {
    this.workspacePath = workspacePath || path.join(process.cwd(), 'workspace');
    this.ensureWorkspaceExists();
  }

  private async ensureWorkspaceExists() {
    if (!existsSync(this.workspacePath)) {
      await fs.mkdir(this.workspacePath, { recursive: true });
    }
  }

  setWorkspace(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.ensureWorkspaceExists();
  }

  getWorkspacePath(): string {
    return this.workspacePath;
  }

  private isPathSafe(filePath: string): boolean {
    const resolvedPath = path.resolve(this.workspacePath, filePath);
    return resolvedPath.startsWith(this.workspacePath);
  }

  async readDirectory(dirPath: string = ''): Promise<FileNode[]> {
    const fullPath = path.join(this.workspacePath, dirPath);
    
    if (!this.isPathSafe(dirPath)) {
      throw new Error('Path is outside workspace');
    }

    if (!existsSync(fullPath)) {
      return [];
    }

    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      // Ignorar archivos y carpetas ocultas y node_modules
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      const entryPath = path.join(dirPath, entry.name);
      const fullEntryPath = path.join(fullPath, entry.name);

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: entryPath,
          type: 'directory',
          children: [], // Se cargarán bajo demanda
        });
      } else {
        const stats = await fs.stat(fullEntryPath);
        const ext = path.extname(entry.name);
        
        nodes.push({
          name: entry.name,
          path: entryPath,
          type: 'file',
          extension: ext,
          size: stats.size,
        });
      }
    }

    // Ordenar: directorios primero, luego archivos alfabéticamente
    return nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  }

  async readFile(filePath: string): Promise<string> {
    if (!this.isPathSafe(filePath)) {
      throw new Error('Path is outside workspace');
    }

    const fullPath = path.join(this.workspacePath, filePath);
    
    if (!existsSync(fullPath)) {
      throw new Error('File not found');
    }

    return await fs.readFile(fullPath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    if (!this.isPathSafe(filePath)) {
      throw new Error('Path is outside workspace');
    }

    const fullPath = path.join(this.workspacePath, filePath);
    const dirPath = path.dirname(fullPath);

    // Crear directorio si no existe
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }

    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async createFile(filePath: string, content: string = ''): Promise<void> {
    await this.writeFile(filePath, content);
  }

  async createDirectory(dirPath: string): Promise<void> {
    if (!this.isPathSafe(dirPath)) {
      throw new Error('Path is outside workspace');
    }

    const fullPath = path.join(this.workspacePath, dirPath);
    await fs.mkdir(fullPath, { recursive: true });
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!this.isPathSafe(filePath)) {
      throw new Error('Path is outside workspace');
    }

    const fullPath = path.join(this.workspacePath, filePath);
    
    if (!existsSync(fullPath)) {
      throw new Error('File not found');
    }

    await fs.unlink(fullPath);
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    if (!this.isPathSafe(dirPath)) {
      throw new Error('Path is outside workspace');
    }

    const fullPath = path.join(this.workspacePath, dirPath);
    
    if (!existsSync(fullPath)) {
      throw new Error('Directory not found');
    }

    await fs.rm(fullPath, { recursive: true, force: true });
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    if (!this.isPathSafe(oldPath) || !this.isPathSafe(newPath)) {
      throw new Error('Path is outside workspace');
    }

    const fullOldPath = path.join(this.workspacePath, oldPath);
    const fullNewPath = path.join(this.workspacePath, newPath);

    if (!existsSync(fullOldPath)) {
      throw new Error('Source file not found');
    }

    await fs.rename(fullOldPath, fullNewPath);
  }

  async getFileTree(): Promise<FileNode[]> {
    return await this.readDirectory('');
  }
}


