import { spawn, ChildProcess } from 'child_process';
import * as os from 'os';
import * as path from 'path';

interface TerminalSession {
  id: string;
  process: ChildProcess;
  workingDirectory: string;
  shell: string;
}

export class TerminalService {
  private sessions: Map<string, TerminalSession> = new Map();
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Crear una nueva sesión de terminal
   */
  createSession(sessionId: string, cwd?: string): TerminalSession {
    const workingDirectory = cwd || this.workspaceRoot;
    const shell = this.getDefaultShell();

    const terminalProcess = spawn(shell, [], {
      cwd: workingDirectory,
      env: { ...process.env },
      shell: true,
    });

    const session: TerminalSession = {
      id: sessionId,
      process: terminalProcess,
      workingDirectory,
      shell,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Ejecutar comando en una sesión específica
   */
  executeCommand(sessionId: string, command: string): Promise<{ output: string; error?: string; exitCode?: number }> {
    return new Promise((resolve, reject) => {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        return reject(new Error(`Session ${sessionId} not found`));
      }

      let output = '';
      let error = '';

      // Crear proceso para el comando
      const commandProcess = spawn(command, [], {
        cwd: session.workingDirectory,
        shell: true,
        env: process.env,
      });

      // Capturar stdout
      commandProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });

      // Capturar stderr
      commandProcess.stderr?.on('data', (data) => {
        error += data.toString();
      });

      // Cuando termine
      commandProcess.on('close', (code) => {
        resolve({
          output,
          error: error || undefined,
          exitCode: code || undefined,
        });
      });

      // Manejar errores
      commandProcess.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Ejecutar código de un lenguaje específico
   */
  async executeCode(
    language: string,
    code: string,
    filename?: string
  ): Promise<{ output: string; error?: string; exitCode?: number }> {
    const tempDir = os.tmpdir();
    const fs = await import('fs/promises');

    try {
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          // Ejecutar con Node.js
          const jsFile = path.join(tempDir, filename || `temp_${Date.now()}.js`);
          await fs.writeFile(jsFile, code);
          const jsResult = await this.executeCommand('temp', `node "${jsFile}"`);
          await fs.unlink(jsFile);
          return jsResult;

        case 'typescript':
        case 'ts':
          // Ejecutar con tsx
          const tsFile = path.join(tempDir, filename || `temp_${Date.now()}.ts`);
          await fs.writeFile(tsFile, code);
          const tsResult = await this.executeCommand('temp', `npx tsx "${tsFile}"`);
          await fs.unlink(tsFile);
          return tsResult;

        case 'python':
        case 'py':
          // Ejecutar con Python
          const pyFile = path.join(tempDir, filename || `temp_${Date.now()}.py`);
          await fs.writeFile(pyFile, code);
          const pyResult = await this.executeCommand('temp', `python "${pyFile}"`);
          await fs.unlink(pyFile);
          return pyResult;

        case 'java':
          // Ejecutar con Java
          const javaFile = path.join(tempDir, filename || `Main.java`);
          await fs.writeFile(javaFile, code);
          await this.executeCommand('temp', `javac "${javaFile}"`);
          const javaResult = await this.executeCommand('temp', `java -cp "${tempDir}" Main`);
          await fs.unlink(javaFile);
          return javaResult;

        case 'c':
          // Compilar y ejecutar C
          const cFile = path.join(tempDir, filename || `temp_${Date.now()}.c`);
          const cOut = path.join(tempDir, `temp_${Date.now()}.out`);
          await fs.writeFile(cFile, code);
          await this.executeCommand('temp', `gcc "${cFile}" -o "${cOut}"`);
          const cResult = await this.executeCommand('temp', `"${cOut}"`);
          await fs.unlink(cFile);
          await fs.unlink(cOut);
          return cResult;

        case 'cpp':
        case 'c++':
          // Compilar y ejecutar C++
          const cppFile = path.join(tempDir, filename || `temp_${Date.now()}.cpp`);
          const cppOut = path.join(tempDir, `temp_${Date.now()}.out`);
          await fs.writeFile(cppFile, code);
          await this.executeCommand('temp', `g++ "${cppFile}" -o "${cppOut}"`);
          const cppResult = await this.executeCommand('temp', `"${cppOut}"`);
          await fs.unlink(cppFile);
          await fs.unlink(cppOut);
          return cppResult;

        default:
          throw new Error(`Language ${language} not supported`);
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1,
      };
    }
  }

  /**
   * Instalar dependencias de un proyecto
   */
  async installDependencies(projectPath: string, packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' = 'npm'): Promise<{ output: string; error?: string }> {
    const commands: Record<string, string> = {
      npm: 'npm install',
      yarn: 'yarn install',
      pnpm: 'pnpm install',
      pip: 'pip install -r requirements.txt',
    };

    const command = commands[packageManager];
    
    return new Promise((resolve, reject) => {
      const process = spawn(command, [], {
        cwd: projectPath,
        shell: true,
        env: process.env,
      });

      let output = '';
      let error = '';

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ output, error: error || undefined });
        } else {
          reject({ output, error: error || 'Installation failed' });
        }
      });

      process.on('error', (err) => {
        reject({ output: '', error: err.message });
      });
    });
  }

  /**
   * Detectar el package manager de un proyecto
   */
  async detectPackageManager(projectPath: string): Promise<'npm' | 'yarn' | 'pnpm' | 'pip' | null> {
    const fs = await import('fs/promises');
    
    try {
      // Verificar archivos de lock
      const files = await fs.readdir(projectPath);
      
      if (files.includes('pnpm-lock.yaml')) return 'pnpm';
      if (files.includes('yarn.lock')) return 'yarn';
      if (files.includes('package-lock.json')) return 'npm';
      if (files.includes('requirements.txt')) return 'pip';
      
      // Verificar package.json
      if (files.includes('package.json')) return 'npm';
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cerrar una sesión
   */
  closeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.process.kill();
      this.sessions.delete(sessionId);
      return true;
    }
    
    return false;
  }

  /**
   * Obtener shell por defecto según el OS
   */
  private getDefaultShell(): string {
    const platform = os.platform();
    
    switch (platform) {
      case 'win32':
        return process.env.COMSPEC || 'cmd.exe';
      case 'darwin':
      case 'linux':
        return process.env.SHELL || '/bin/bash';
      default:
        return 'sh';
    }
  }

  /**
   * Limpiar todas las sesiones
   */
  closeAllSessions(): void {
    this.sessions.forEach((session) => {
      session.process.kill();
    });
    this.sessions.clear();
  }
}
