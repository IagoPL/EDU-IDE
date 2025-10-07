import { fileCache } from './file-cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
  size?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private useCache: boolean = true;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Habilitar o deshabilitar caché
   */
  setCacheEnabled(enabled: boolean) {
    this.useCache = enabled;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Files API
  async getFileTree(): Promise<ApiResponse<FileNode[]>> {
    return this.request<FileNode[]>('/api/files/tree');
  }

  async readDirectory(path: string = ''): Promise<ApiResponse<FileNode[]>> {
    const query = path ? `?path=${encodeURIComponent(path)}` : '';
    return this.request<FileNode[]>(`/api/files/directory${query}`);
  }

  async readFile(path: string, forceRefresh: boolean = false): Promise<ApiResponse<{ path: string; content: string }>> {
    // Intentar obtener de caché primero
    if (this.useCache && !forceRefresh) {
      const cached = fileCache.get(path);
      if (cached) {
        return {
          success: true,
          data: {
            path,
            content: cached.content,
          },
        };
      }
    }

    // Si no está en caché o se fuerza refresh, hacer request
    const response = await this.request<{ path: string; content: string }>(
      `/api/files/read?path=${encodeURIComponent(path)}`
    );

    // Si la respuesta fue exitosa, guardar en caché
    if (response.success && response.data) {
      const language = this.getLanguageFromPath(path);
      fileCache.set(path, response.data.content, language);
    }

    return response;
  }

  /**
   * Obtener lenguaje según la extensión del archivo
   */
  private getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };
    return languageMap[ext || ''] || 'plaintext';
  }

  async writeFile(path: string, content: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/api/files/write', {
      method: 'POST',
      body: JSON.stringify({ path, content }),
    });

    // Actualizar caché con el nuevo contenido
    if (response.success) {
      fileCache.update(path, content);
    }

    return response;
  }

  async createFile(path: string, content: string = ''): Promise<ApiResponse<void>> {
    return this.request<void>('/api/files/create', {
      method: 'POST',
      body: JSON.stringify({ path, content }),
    });
  }

  async createDirectory(path: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/files/create-directory', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  async deleteFile(path: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(`/api/files/delete?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });

    // Invalidar caché del archivo eliminado
    if (response.success) {
      fileCache.invalidate(path);
    }

    return response;
  }

  async deleteDirectory(path: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(`/api/files/delete-directory?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });

    // Invalidar caché de todos los archivos en ese directorio
    if (response.success) {
      const pattern = new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
      fileCache.invalidatePattern(pattern);
    }

    return response;
  }

  async renameFile(oldPath: string, newPath: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/api/files/rename', {
      method: 'PUT',
      body: JSON.stringify({ oldPath, newPath }),
    });

    // Invalidar caché del archivo antiguo
    if (response.success) {
      fileCache.invalidate(oldPath);
    }

    return response;
  }

  async setWorkspace(path: string): Promise<ApiResponse<{ path: string }>> {
    return this.request<{ path: string }>('/api/files/set-workspace', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  async getWorkspace(): Promise<ApiResponse<{ path: string }>> {
    return this.request<{ path: string }>('/api/files/workspace');
  }

  // Projects API
  async getProjects(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/projects');
  }

  async getProject(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/projects/${id}`);
  }

  async createProject(data: {
    name: string;
    type: string;
    language: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProject(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTemplates(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/projects/templates/list');
  }
}

export const api = new ApiClient();

