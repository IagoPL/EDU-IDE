import simpleGit, { SimpleGit, StatusResult, LogResult, DiffResult, BranchSummary } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';

export interface GitFileStatus {
  path: string;
  status: string; // 'M' (modified), 'A' (added), 'D' (deleted), 'R' (renamed), 'U' (untracked)
  staged: boolean;
}

export interface GitCommitInfo {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
}

export interface GitBranchInfo {
  name: string;
  current: boolean;
  commit: string;
}

export class GitService {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  /**
   * Obtiene la instancia de Git para el workspace actual
   */
  private getGit(): SimpleGit {
    return simpleGit(this.workspacePath);
  }

  /**
   * Verifica si el directorio actual es un repositorio Git
   */
  async isGitRepository(): Promise<boolean> {
    try {
      const git = this.getGit();
      await git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Inicializa un nuevo repositorio Git
   */
  async init(): Promise<void> {
    const git = this.getGit();
    await git.init();
  }

  /**
   * Obtiene el estado actual del repositorio
   */
  async getStatus(): Promise<GitFileStatus[]> {
    const git = this.getGit();
    const status: StatusResult = await git.status();

    const files: GitFileStatus[] = [];

    // Archivos modificados (staged)
    status.staged.forEach((file) => {
      files.push({
        path: file,
        status: 'M',
        staged: true,
      });
    });

    // Archivos modificados (not staged)
    status.modified.forEach((file) => {
      if (!status.staged.includes(file)) {
        files.push({
          path: file,
          status: 'M',
          staged: false,
        });
      }
    });

    // Archivos creados (not staged)
    status.created.forEach((file) => {
      files.push({
        path: file,
        status: 'A',
        staged: true,
      });
    });

    // Archivos eliminados (staged)
    status.deleted.forEach((file) => {
      files.push({
        path: file,
        status: 'D',
        staged: true,
      });
    });

    // Archivos sin rastrear
    status.not_added.forEach((file) => {
      files.push({
        path: file,
        status: 'U',
        staged: false,
      });
    });

    // Archivos renombrados
    status.renamed.forEach((file) => {
      files.push({
        path: file.to,
        status: 'R',
        staged: true,
      });
    });

    return files;
  }

  /**
   * Agrega archivos al staging area
   */
  async add(files: string[]): Promise<void> {
    const git = this.getGit();
    
    if (files.length === 0 || files.includes('.')) {
      // Agregar todos los archivos
      await git.add('.');
    } else {
      // Agregar archivos específicos
      await git.add(files);
    }
  }

  /**
   * Crea un commit
   */
  async commit(message: string): Promise<string> {
    const git = this.getGit();
    const result = await git.commit(message);
    return result.commit;
  }

  /**
   * Hace push de los cambios al repositorio remoto
   */
  async push(remote: string = 'origin', branch?: string): Promise<void> {
    const git = this.getGit();
    
    if (branch) {
      await git.push(remote, branch);
    } else {
      await git.push();
    }
  }

  /**
   * Hace pull de los cambios del repositorio remoto
   */
  async pull(remote: string = 'origin', branch?: string): Promise<void> {
    const git = this.getGit();
    
    if (branch) {
      await git.pull(remote, branch);
    } else {
      await git.pull();
    }
  }

  /**
   * Obtiene el historial de commits
   */
  async getLog(limit: number = 50): Promise<GitCommitInfo[]> {
    const git = this.getGit();
    const log: LogResult = await git.log({ maxCount: limit });

    return log.all.map((commit) => ({
      hash: commit.hash,
      author: commit.author_name,
      email: commit.author_email,
      date: commit.date,
      message: commit.message,
    }));
  }

  /**
   * Obtiene la lista de branches
   */
  async getBranches(): Promise<GitBranchInfo[]> {
    const git = this.getGit();
    const branches: BranchSummary = await git.branch();

    return Object.keys(branches.branches).map((name) => ({
      name,
      current: name === branches.current,
      commit: branches.branches[name].commit,
    }));
  }

  /**
   * Crea un nuevo branch
   */
  async createBranch(branchName: string): Promise<void> {
    const git = this.getGit();
    await git.checkoutLocalBranch(branchName);
  }

  /**
   * Cambia a un branch existente
   */
  async checkout(branchName: string): Promise<void> {
    const git = this.getGit();
    await git.checkout(branchName);
  }

  /**
   * Elimina un branch
   */
  async deleteBranch(branchName: string, force: boolean = false): Promise<void> {
    const git = this.getGit();
    await git.deleteLocalBranch(branchName, force);
  }

  /**
   * Obtiene el diff de un archivo
   */
  async getDiff(filePath?: string): Promise<string> {
    const git = this.getGit();
    
    if (filePath) {
      const diff = await git.diff(['--', filePath]);
      return diff;
    } else {
      const diff = await git.diff();
      return diff;
    }
  }

  /**
   * Obtiene el diff entre staged y HEAD
   */
  async getStagedDiff(filePath?: string): Promise<string> {
    const git = this.getGit();
    
    if (filePath) {
      const diff = await git.diff(['--cached', '--', filePath]);
      return diff;
    } else {
      const diff = await git.diff(['--cached']);
      return diff;
    }
  }

  /**
   * Descarta cambios en un archivo
   */
  async discardChanges(filePath: string): Promise<void> {
    const git = this.getGit();
    await git.checkout(['--', filePath]);
  }

  /**
   * Quita un archivo del staging area
   */
  async unstage(filePath: string): Promise<void> {
    const git = this.getGit();
    await git.reset(['HEAD', '--', filePath]);
  }

  /**
   * Obtiene información del repositorio remoto
   */
  async getRemotes(): Promise<Array<{ name: string; url: string }>> {
    const git = this.getGit();
    const remotes = await git.getRemotes(true);
    
    return remotes.map((remote) => ({
      name: remote.name,
      url: remote.refs.fetch || remote.refs.push || '',
    }));
  }

  /**
   * Clona un repositorio
   */
  static async clone(repoUrl: string, targetPath: string): Promise<void> {
    await simpleGit().clone(repoUrl, targetPath);
  }

  /**
   * Configura el usuario de Git
   */
  async setConfig(name: string, email: string): Promise<void> {
    const git = this.getGit();
    await git.addConfig('user.name', name);
    await git.addConfig('user.email', email);
  }

  /**
   * Obtiene la configuración actual de Git
   */
  async getConfig(): Promise<{ name?: string; email?: string }> {
    const git = this.getGit();
    
    try {
      const name = await git.getConfig('user.name');
      const email = await git.getConfig('user.email');
      
      return {
        name: name.value || undefined,
        email: email.value || undefined,
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Git Stash - Guardar cambios temporalmente
   */
  async stash(message?: string): Promise<void> {
    const git = this.getGit();
    if (message) {
      await git.stash(['push', '-m', message]);
    } else {
      await git.stash();
    }
  }

  /**
   * Listar stashes
   */
  async stashList(): Promise<Array<{ index: number; message: string; hash: string }>> {
    const git = this.getGit();
    const result = await git.stashList();
    
    return result.all.map((stash, index) => ({
      index,
      message: stash.message,
      hash: stash.hash
    }));
  }

  /**
   * Aplicar stash
   */
  async stashApply(index: number = 0): Promise<void> {
    const git = this.getGit();
    await git.stash(['apply', `stash@{${index}}`]);
  }

  /**
   * Eliminar stash
   */
  async stashDrop(index: number = 0): Promise<void> {
    const git = this.getGit();
    await git.stash(['drop', `stash@{${index}}`]);
  }

  /**
   * Aplicar y eliminar stash
   */
  async stashPop(index: number = 0): Promise<void> {
    const git = this.getGit();
    await git.stash(['pop', `stash@{${index}}`]);
  }

  /**
   * Obtener remotos configurados
   */
  async getRemotes(): Promise<Array<{ name: string; url: string }>> {
    const git = this.getGit();
    const remotes = await git.getRemotes(true);
    
    return remotes.map(remote => ({
      name: remote.name,
      url: remote.refs.fetch || remote.refs.push || ''
    }));
  }

  /**
   * Agregar remoto
   */
  async addRemote(name: string, url: string): Promise<void> {
    const git = this.getGit();
    await git.addRemote(name, url);
  }

  /**
   * Eliminar remoto
   */
  async removeRemote(name: string): Promise<void> {
    const git = this.getGit();
    await git.removeRemote(name);
  }

  /**
   * Obtener blame de un archivo (quién modificó cada línea)
   */
  async blame(file: string): Promise<Array<{
    line: number;
    author: string;
    hash: string;
    date: string;
    content: string;
  }>> {
    const git = this.getGit();
    
    try {
      // simple-git no tiene blame directo, usamos raw
      const result = await git.raw(['blame', '--line-porcelain', file]);
      
      return this.parseBlameOutput(result);
    } catch (error) {
      throw new Error(`Error getting blame: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parsear output de git blame
   */
  private parseBlameOutput(blameOutput: string): Array<{
    line: number;
    author: string;
    hash: string;
    date: string;
    content: string;
  }> {
    const lines = blameOutput.split('\n');
    const result = [];
    let currentHash = '';
    let currentAuthor = '';
    let currentDate = '';
    let lineNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.match(/^[0-9a-f]{40}/)) {
        currentHash = line.split(' ')[0];
        lineNumber++;
      } else if (line.startsWith('author ')) {
        currentAuthor = line.substring(7);
      } else if (line.startsWith('author-time ')) {
        const timestamp = parseInt(line.substring(12));
        currentDate = new Date(timestamp * 1000).toISOString();
      } else if (line.startsWith('\t')) {
        result.push({
          line: lineNumber,
          author: currentAuthor,
          hash: currentHash.substring(0, 8),
          date: currentDate,
          content: line.substring(1)
        });
      }
    }

    return result;
  }

  /**
   * Obtener tags
   */
  async getTags(): Promise<Array<{ name: string; hash: string; message?: string }>> {
    const git = this.getGit();
    const tags = await git.tags();
    
    return Promise.all(
      tags.all.map(async (tag) => {
        try {
          const show = await git.show([tag]);
          return {
            name: tag,
            hash: show.substring(0, 40),
            message: show.split('\n')[4] || ''
          };
        } catch {
          return {
            name: tag,
            hash: '',
            message: ''
          };
        }
      })
    );
  }

  /**
   * Crear tag
   */
  async createTag(name: string, message?: string): Promise<void> {
    const git = this.getGit();
    if (message) {
      await git.addTag(name);
      await git.tag(['-a', name, '-m', message, '-f']);
    } else {
      await git.addTag(name);
    }
  }

  /**
   * Eliminar tag
   */
  async deleteTag(name: string): Promise<void> {
    const git = this.getGit();
    await git.tag(['-d', name]);
  }

  /**
   * Obtener archivo en un commit específico
   */
  async getFileAtCommit(file: string, commit: string): Promise<string> {
    const git = this.getGit();
    
    try {
      const content = await git.show([`${commit}:${file}`]);
      return content;
    } catch (error) {
      throw new Error(`Error getting file at commit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualizar workspace path
   */
  setWorkspace(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  getWorkspacePath(): string {
    return this.workspacePath;
  }
}

