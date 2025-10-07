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
}

