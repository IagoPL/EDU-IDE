import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface ShellInfo {
  id: string;
  name: string;
  command: string;
  args: string[];
  available: boolean;
  version?: string;
  icon: string;
  description: string;
  category: 'system' | 'bash' | 'wsl' | 'custom';
}

export class ShellDetectionService {
  private shells: ShellInfo[] = [];

  constructor() {
    this.initializeShells();
  }

  /**
   * Inicializa la lista de shells a detectar
   */
  private initializeShells() {
    const platform = process.platform;

    if (platform === 'win32') {
      // Windows shells
      this.shells = [
        {
          id: 'powershell',
          name: 'PowerShell',
          command: 'powershell.exe',
          args: ['-NoLogo'],
          available: false,
          icon: '🔷',
          description: 'Windows PowerShell',
          category: 'system'
        },
        {
          id: 'pwsh',
          name: 'PowerShell Core',
          command: 'pwsh.exe',
          args: ['-NoLogo'],
          available: false,
          icon: '💙',
          description: 'PowerShell 7+ (Core)',
          category: 'system'
        },
        {
          id: 'cmd',
          name: 'Command Prompt',
          command: 'cmd.exe',
          args: ['/K'],
          available: false,
          icon: '⬛',
          description: 'Windows CMD',
          category: 'system'
        },
        {
          id: 'git-bash',
          name: 'Git Bash',
          command: 'C:\\Program Files\\Git\\bin\\bash.exe',
          args: ['--login', '-i'],
          available: false,
          icon: '🦊',
          description: 'Git Bash (MINGW)',
          category: 'bash'
        },
        {
          id: 'wsl',
          name: 'WSL (Ubuntu)',
          command: 'wsl.exe',
          args: [],
          available: false,
          icon: '🐧',
          description: 'Windows Subsystem for Linux',
          category: 'wsl'
        },
        {
          id: 'wsl-bash',
          name: 'WSL Bash',
          command: 'wsl.exe',
          args: ['bash'],
          available: false,
          icon: '🐧',
          description: 'Bash en WSL',
          category: 'wsl'
        }
      ];
    } else if (platform === 'darwin') {
      // macOS shells
      this.shells = [
        {
          id: 'zsh',
          name: 'Zsh',
          command: '/bin/zsh',
          args: ['-l'],
          available: false,
          icon: '⚡',
          description: 'Z Shell (default en macOS)',
          category: 'system'
        },
        {
          id: 'bash',
          name: 'Bash',
          command: '/bin/bash',
          args: ['-l'],
          available: false,
          icon: '🐚',
          description: 'Bourne Again Shell',
          category: 'bash'
        },
        {
          id: 'sh',
          name: 'sh',
          command: '/bin/sh',
          args: [],
          available: false,
          icon: '📟',
          description: 'Bourne Shell',
          category: 'system'
        }
      ];
    } else {
      // Linux shells
      this.shells = [
        {
          id: 'bash',
          name: 'Bash',
          command: '/bin/bash',
          args: [],
          available: false,
          icon: '🐚',
          description: 'Bourne Again Shell',
          category: 'bash'
        },
        {
          id: 'zsh',
          name: 'Zsh',
          command: '/bin/zsh',
          args: ['-l'],
          available: false,
          icon: '⚡',
          description: 'Z Shell',
          category: 'system'
        },
        {
          id: 'sh',
          name: 'sh',
          command: '/bin/sh',
          args: [],
          available: false,
          icon: '📟',
          description: 'Bourne Shell',
          category: 'system'
        },
        {
          id: 'fish',
          name: 'Fish',
          command: '/usr/bin/fish',
          args: [],
          available: false,
          icon: '🐠',
          description: 'Friendly Interactive Shell',
          category: 'custom'
        }
      ];
    }
  }

  /**
   * Detecta qué shells están disponibles en el sistema
   */
  async detectAvailableShells(): Promise<ShellInfo[]> {
    const platform = process.platform;
    const detectionPromises = this.shells.map(async (shell) => {
      const available = await this.checkShellAvailable(shell, platform);
      return {
        ...shell,
        available,
        version: available ? await this.getShellVersion(shell) : undefined
      };
    });

    const results = await Promise.all(detectionPromises);
    return results.filter(shell => shell.available);
  }

  /**
   * Verifica si un shell está disponible
   */
  private async checkShellAvailable(shell: ShellInfo, platform: string): Promise<boolean> {
    try {
      if (platform === 'win32') {
        // En Windows, verificar si el ejecutable existe
        if (shell.id === 'wsl' || shell.id === 'wsl-bash') {
          // Verificar WSL
          try {
            await execAsync('wsl.exe --status', { timeout: 3000 });
            return true;
          } catch {
            return false;
          }
        }

        // Para otros shells de Windows
        if (existsSync(shell.command)) {
          return true;
        }

        // Intentar ejecutar desde PATH
        try {
          await execAsync(`where ${shell.command}`, { timeout: 3000 });
          return true;
        } catch {
          return false;
        }
      } else {
        // En Unix, verificar si existe el archivo
        return existsSync(shell.command);
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene la versión del shell
   */
  private async getShellVersion(shell: ShellInfo): Promise<string> {
    try {
      let versionCommand = '';

      switch (shell.id) {
        case 'powershell':
        case 'pwsh':
          versionCommand = `${shell.command} -Command "$PSVersionTable.PSVersion.ToString()"`;
          break;
        case 'cmd':
          return 'Windows CMD';
        case 'bash':
        case 'git-bash':
        case 'zsh':
        case 'sh':
          versionCommand = `${shell.command} --version`;
          break;
        case 'wsl':
        case 'wsl-bash':
          versionCommand = 'wsl.exe --version';
          break;
        default:
          return 'Unknown';
      }

      const { stdout } = await execAsync(versionCommand, { timeout: 3000 });
      return stdout.split('\n')[0].trim() || 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Obtiene el shell por defecto según el sistema operativo
   */
  getDefaultShell(): ShellInfo {
    const platform = process.platform;

    if (platform === 'win32') {
      return this.shells.find(s => s.id === 'powershell') || this.shells[0];
    } else if (platform === 'darwin') {
      return this.shells.find(s => s.id === 'zsh') || this.shells[0];
    } else {
      return this.shells.find(s => s.id === 'bash') || this.shells[0];
    }
  }

  /**
   * Obtiene un shell por ID
   */
  getShellById(id: string): ShellInfo | null {
    return this.shells.find(s => s.id === id) || null;
  }

  /**
   * Obtiene comandos comunes para autocompletado
   */
  getCommonCommands(shellId: string): string[] {
    const commonCommands: { [key: string]: string[] } = {
      powershell: [
        'Get-ChildItem', 'Set-Location', 'Get-Content', 'New-Item', 'Remove-Item',
        'Copy-Item', 'Move-Item', 'Get-Process', 'Stop-Process', 'Clear-Host',
        'Get-Help', 'Get-Command', 'Select-String', 'Measure-Object', 'Sort-Object',
        'npm', 'node', 'git', 'python', 'pip', 'code'
      ],
      cmd: [
        'dir', 'cd', 'mkdir', 'rmdir', 'del', 'copy', 'move', 'type', 'cls',
        'echo', 'set', 'path', 'tasklist', 'taskkill',
        'npm', 'node', 'git', 'python', 'pip'
      ],
      bash: [
        'ls', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'find',
        'chmod', 'chown', 'ps', 'kill', 'top', 'clear', 'echo', 'export',
        'npm', 'node', 'git', 'python', 'pip', 'docker', 'kubectl'
      ],
      'git-bash': [
        'ls', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'find',
        'git', 'npm', 'node', 'python', 'clear', 'echo', 'export'
      ],
      wsl: [
        'ls', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'find',
        'apt', 'apt-get', 'sudo', 'chmod', 'ps', 'kill', 'clear',
        'git', 'npm', 'node', 'python', 'pip', 'docker'
      ]
    };

    return commonCommands[shellId] || commonCommands['bash'];
  }

  /**
   * Obtiene snippets de comandos comunes
   */
  getCommandSnippets(shellId: string): { [key: string]: { command: string; description: string } } {
    const platform = process.platform;

    if (platform === 'win32' && (shellId === 'powershell' || shellId === 'pwsh')) {
      return {
        'ls': { command: 'Get-ChildItem', description: 'Listar archivos' },
        'find': { command: 'Get-ChildItem -Recurse -Filter', description: 'Buscar archivos' },
        'gitlog': { command: 'git log --oneline --graph --all', description: 'Ver historial Git gráfico' },
        'gitst': { command: 'git status', description: 'Estado de Git' },
        'serve': { command: 'npx serve', description: 'Servidor HTTP rápido' },
        'killport': { command: 'Get-Process -Id (Get-NetTCPConnection -LocalPort $PORT).OwningProcess | Stop-Process', description: 'Matar proceso en puerto' }
      };
    } else {
      return {
        'll': { command: 'ls -lah', description: 'Listar archivos detallado' },
        'gitlog': { command: 'git log --oneline --graph --all', description: 'Ver historial Git gráfico' },
        'gitst': { command: 'git status', description: 'Estado de Git' },
        'serve': { command: 'npx serve', description: 'Servidor HTTP rápido' },
        'killport': { command: 'lsof -ti:$PORT | xargs kill', description: 'Matar proceso en puerto' },
        'cls': { command: 'clear', description: 'Limpiar terminal' }
      };
    }
  }
}

