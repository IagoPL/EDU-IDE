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

  async setWorkspace(path: string): Promise<ApiResponse<{ path: string }>> {
    return this.request<{ path: string }>('/api/files/workspace', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  async validatePath(path: string): Promise<ApiResponse<{ valid: boolean; reason?: string }>> {
    return this.request<{ valid: boolean; reason?: string }>('/api/files/validate-path', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  async openFilePicker(defaultPath?: string): Promise<ApiResponse<{ path?: string; cancelled: boolean }>> {
    return this.request<{ path?: string; cancelled: boolean }>('/api/files/open-file-picker', {
      method: 'POST',
      body: JSON.stringify({ defaultPath }),
    });
  }

  async searchInFiles(params: {
    query: string;
    caseSensitive?: boolean;
    useRegex?: boolean;
    wholeWord?: boolean;
    includePattern?: string;
    excludePattern?: string;
  }): Promise<ApiResponse<Array<{
    file: string;
    line: number;
    column: number;
    text: string;
    matchStart: number;
    matchEnd: number;
  }>>> {
    return this.request('/api/files/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
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

  // Terminal API
  async executeCommand(command: string, sessionId?: string): Promise<ApiResponse<{ output: string; error?: string; exitCode?: number }>> {
    return this.request('/api/terminal/execute', {
      method: 'POST',
      body: JSON.stringify({ command, sessionId }),
    });
  }

  async executeCode(code: string, language: string, filename?: string): Promise<ApiResponse<{ output: string; error?: string; exitCode?: number }>> {
    return this.request('/api/terminal/execute-code', {
      method: 'POST',
      body: JSON.stringify({ code, language, filename }),
    });
  }

  async installDependencies(projectPath: string, packageManager?: 'npm' | 'yarn' | 'pnpm' | 'pip'): Promise<ApiResponse<{ output: string; error?: string }>> {
    return this.request('/api/terminal/install-dependencies', {
      method: 'POST',
      body: JSON.stringify({ projectPath, packageManager }),
    });
  }

  async detectPackageManager(path: string): Promise<ApiResponse<{ packageManager: string | null }>> {
    return this.request(`/api/terminal/detect-package-manager?path=${encodeURIComponent(path)}`);
  }

  // ========================================
  // GIT METHODS
  // ========================================

  /**
   * Obtiene el estado de Git del workspace
   */
  async getGitStatus(): Promise<ApiResponse<{ files: Array<{ path: string; status: string; staged: boolean }> }>> {
    return this.request('/api/git/status');
  }

  /**
   * Inicializa un repositorio Git
   */
  async gitInit(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/init', {
      method: 'POST',
    });
  }

  /**
   * Agrega archivos al staging area
   */
  async gitAdd(files: string[]): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/add', {
      method: 'POST',
      body: JSON.stringify({ files }),
    });
  }

  /**
   * Crea un commit
   */
  async gitCommit(message: string): Promise<ApiResponse<{ commit: string; message: string }>> {
    return this.request('/api/git/commit', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Hace push al repositorio remoto
   */
  async gitPush(remote?: string, branch?: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/push', {
      method: 'POST',
      body: JSON.stringify({ remote, branch }),
    });
  }

  /**
   * Hace pull del repositorio remoto
   */
  async gitPull(remote?: string, branch?: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/pull', {
      method: 'POST',
      body: JSON.stringify({ remote, branch }),
    });
  }

  /**
   * Obtiene el historial de commits
   */
  async gitLog(limit?: number): Promise<ApiResponse<{ commits: Array<{ hash: string; author: string; email: string; date: string; message: string }> }>> {
    const queryParam = limit ? `?limit=${limit}` : '';
    return this.request(`/api/git/log${queryParam}`);
  }

  /**
   * Obtiene la lista de branches
   */
  async gitGetBranches(): Promise<ApiResponse<{ branches: Array<{ name: string; current: boolean; commit: string }> }>> {
    return this.request('/api/git/branches');
  }

  /**
   * Crea un nuevo branch
   */
  async gitCreateBranch(name: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/branch/create', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Cambia a un branch existente
   */
  async gitCheckout(branch: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/checkout', {
      method: 'POST',
      body: JSON.stringify({ branch }),
    });
  }

  /**
   * Elimina un branch
   */
  async gitDeleteBranch(name: string, force: boolean = false): Promise<ApiResponse<{ message: string }>> {
    const queryParam = force ? '?force=true' : '';
    return this.request(`/api/git/branch/${encodeURIComponent(name)}${queryParam}`, {
      method: 'DELETE',
    });
  }

  /**
   * Obtiene el diff de cambios
   */
  async gitDiff(file?: string, staged: boolean = false): Promise<ApiResponse<{ diff: string }>> {
    const params = new URLSearchParams();
    if (file) params.append('file', file);
    if (staged) params.append('staged', 'true');
    
    const queryString = params.toString();
    return this.request(`/api/git/diff${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Descarta cambios en un archivo
   */
  async gitDiscardChanges(file: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/discard', {
      method: 'POST',
      body: JSON.stringify({ file }),
    });
  }

  /**
   * Quita un archivo del staging area
   */
  async gitUnstage(file: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/unstage', {
      method: 'POST',
      body: JSON.stringify({ file }),
    });
  }

  /**
   * Obtiene los repositorios remotos
   */
  async gitGetRemotes(): Promise<ApiResponse<{ remotes: Array<{ name: string; url: string }> }>> {
    return this.request('/api/git/remotes');
  }

  /**
   * Obtiene la configuración de Git
   */
  async gitGetConfig(): Promise<ApiResponse<{ config: { name?: string; email?: string } }>> {
    return this.request('/api/git/config');
  }

  /**
   * Configura el usuario de Git
   */
  async gitSetConfig(name: string, email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/git/config', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
  }

  // Debug API
  async startDebug(file: string, args: string[] = []): Promise<ApiResponse<any>> {
    return this.request('/api/debug/start', {
      method: 'POST',
      body: JSON.stringify({ file, args }),
    });
  }

  async stopDebug(sessionId: string): Promise<ApiResponse<void>> {
    return this.request('/api/debug/stop', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async setBreakpoint(sessionId: string, file: string, line: number, condition?: string): Promise<ApiResponse<any>> {
    return this.request('/api/debug/breakpoint/set', {
      method: 'POST',
      body: JSON.stringify({ sessionId, file, line, condition }),
    });
  }

  async removeBreakpoint(sessionId: string, breakpointId: string): Promise<ApiResponse<void>> {
    return this.request('/api/debug/breakpoint/remove', {
      method: 'POST',
      body: JSON.stringify({ sessionId, breakpointId }),
    });
  }

  async toggleBreakpoint(sessionId: string, breakpointId: string): Promise<ApiResponse<void>> {
    return this.request('/api/debug/breakpoint/toggle', {
      method: 'POST',
      body: JSON.stringify({ sessionId, breakpointId }),
    });
  }

  async debugContinue(sessionId: string): Promise<ApiResponse<void>> {
    return this.request('/api/debug/continue', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async debugPause(sessionId: string): Promise<ApiResponse<void>> {
    return this.request('/api/debug/pause', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async debugStepOver(sessionId: string): Promise<ApiResponse<void>> {
    return this.request('/api/debug/step/over', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async debugStepInto(sessionId: string): Promise<ApiResponse<void>> {
    return this.request('/api/debug/step/into', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async debugStepOut(sessionId: string): Promise<ApiResponse<void>> {
    return this.request('/api/debug/step/out', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async getDebugSession(): Promise<ApiResponse<any>> {
    return this.request('/api/debug/session/current');
  }

  async getDebugSessions(): Promise<ApiResponse<any[]>> {
    return this.request('/api/debug/sessions');
  }

  // Testing API
  async detectTestFramework(): Promise<ApiResponse<{ framework: 'jest' | 'mocha' | 'pytest' | null }>> {
    return this.request('/api/testing/detect-framework');
  }

  async discoverTests(framework?: 'jest' | 'mocha' | 'pytest'): Promise<ApiResponse<{ testFiles: string[] }>> {
    const params = framework ? `?framework=${framework}` : '';
    return this.request(`/api/testing/discover${params}`);
  }

  async runAllTests(framework: 'jest' | 'mocha' | 'pytest', coverage: boolean = false): Promise<ApiResponse<any>> {
    return this.request('/api/testing/run', {
      method: 'POST',
      body: JSON.stringify({ framework, coverage }),
    });
  }

  async runTestFile(file: string, framework: 'jest' | 'mocha' | 'pytest'): Promise<ApiResponse<any>> {
    return this.request('/api/testing/run-file', {
      method: 'POST',
      body: JSON.stringify({ file, framework }),
    });
  }

  async getCoverage(): Promise<ApiResponse<any>> {
    return this.request('/api/testing/coverage');
  }

  // Documentation API
  async getDocumentationByLanguage(language: string): Promise<ApiResponse<{ resources: any[] }>> {
    return this.request(`/api/documentation/language/${language}`);
  }

  async getDocumentationByFramework(framework: string): Promise<ApiResponse<{ resources: any[] }>> {
    return this.request(`/api/documentation/framework/${framework}`);
  }

  async getRecommendedDocs(file: string): Promise<ApiResponse<{ resources: any[] }>> {
    return this.request(`/api/documentation/recommend?file=${encodeURIComponent(file)}`);
  }

  async getDocumentationCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    return this.request('/api/documentation/categories');
  }

  async searchDocumentation(tags: string[]): Promise<ApiResponse<{ resources: any[] }>> {
    return this.request(`/api/documentation/search?tags=${tags.join(',')}`);
  }

  // Snippets API
  async getSnippetsByLanguage(language: string): Promise<ApiResponse<{ snippets: any[] }>> {
    return this.request(`/api/snippets/language/${language}`);
  }

  async getSnippetsByCategory(category: string): Promise<ApiResponse<{ snippets: any[] }>> {
    return this.request(`/api/snippets/category/${category}`);
  }

  async getSnippetsByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<ApiResponse<{ snippets: any[] }>> {
    return this.request(`/api/snippets/level/${level}`);
  }

  async searchSnippets(query: string): Promise<ApiResponse<{ snippets: any[] }>> {
    return this.request(`/api/snippets/search?q=${encodeURIComponent(query)}`);
  }

  async getSnippetCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    return this.request('/api/snippets/categories');
  }

  async getRecommendedSnippets(file: string): Promise<ApiResponse<{ snippets: any[] }>> {
    return this.request(`/api/snippets/recommend?file=${encodeURIComponent(file)}`);
  }

  async getSnippetById(id: string): Promise<ApiResponse<{ snippet: any }>> {
    return this.request(`/api/snippets/${id}`);
  }
}

export const api = new ApiClient();

