import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import inspector from 'inspector';

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  enabled: boolean;
}

export interface DebugVariable {
  name: string;
  value: string;
  type: string;
  variablesReference?: number;
}

export interface StackFrame {
  id: number;
  name: string;
  file: string;
  line: number;
  column: number;
}

export interface DebugSession {
  id: string;
  file: string;
  process?: ChildProcess;
  debuggerUrl?: string;
  breakpoints: Map<string, Breakpoint[]>;
  state: 'stopped' | 'running' | 'paused';
}

export class DebugService extends EventEmitter {
  private sessions: Map<string, DebugSession> = new Map();
  private currentSessionId: string | null = null;

  constructor() {
    super();
  }

  async startDebugSession(file: string, args: string[] = []): Promise<DebugSession> {
    const sessionId = this.generateSessionId();
    
    // Crear sesión
    const session: DebugSession = {
      id: sessionId,
      file,
      breakpoints: new Map(),
      state: 'stopped'
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    // Iniciar proceso de Node.js con inspector
    const debugProcess = spawn('node', [
      '--inspect-brk=0', // Puerto aleatorio
      file,
      ...args
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    session.process = debugProcess;

    // Capturar URL del debugger
    return new Promise((resolve, reject) => {
      let output = '';

      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando debugger URL'));
      }, 10000);

      debugProcess.stderr?.on('data', (data) => {
        output += data.toString();
        
        // Buscar URL del WebSocket debugger
        const match = output.match(/ws:\/\/127\.0\.0\.1:(\d+)\/([a-f0-9-]+)/);
        if (match) {
          clearTimeout(timeout);
          session.debuggerUrl = match[0];
          session.state = 'paused';
          this.emit('session-started', session);
          resolve(session);
        }
      });

      debugProcess.stdout?.on('data', (data) => {
        this.emit('console-output', {
          sessionId,
          type: 'log',
          message: data.toString()
        });
      });

      debugProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      debugProcess.on('exit', (code) => {
        this.emit('session-ended', { sessionId, code });
        this.sessions.delete(sessionId);
        if (this.currentSessionId === sessionId) {
          this.currentSessionId = null;
        }
      });
    });
  }

  async stopDebugSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    if (session.process) {
      session.process.kill();
    }

    this.sessions.delete(sessionId);
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }

    this.emit('session-ended', { sessionId });
  }

  async setBreakpoint(sessionId: string, file: string, line: number, condition?: string): Promise<Breakpoint> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    const breakpoint: Breakpoint = {
      id: this.generateBreakpointId(),
      file,
      line,
      condition,
      enabled: true
    };

    if (!session.breakpoints.has(file)) {
      session.breakpoints.set(file, []);
    }

    session.breakpoints.get(file)!.push(breakpoint);
    this.emit('breakpoint-added', { sessionId, breakpoint });

    return breakpoint;
  }

  async removeBreakpoint(sessionId: string, breakpointId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    for (const [file, breakpoints] of session.breakpoints.entries()) {
      const index = breakpoints.findIndex(bp => bp.id === breakpointId);
      if (index !== -1) {
        breakpoints.splice(index, 1);
        if (breakpoints.length === 0) {
          session.breakpoints.delete(file);
        }
        this.emit('breakpoint-removed', { sessionId, breakpointId });
        return;
      }
    }
  }

  async toggleBreakpoint(sessionId: string, breakpointId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    for (const breakpoints of session.breakpoints.values()) {
      const breakpoint = breakpoints.find(bp => bp.id === breakpointId);
      if (breakpoint) {
        breakpoint.enabled = !breakpoint.enabled;
        this.emit('breakpoint-toggled', { sessionId, breakpoint });
        return;
      }
    }
  }

  async continue(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    session.state = 'running';
    this.emit('state-changed', { sessionId, state: 'running' });
    
    // Enviar comando CDP (Chrome DevTools Protocol)
    // Esta es una implementación simplificada
    // En producción usarías el cliente CDP real
  }

  async pause(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    session.state = 'paused';
    this.emit('state-changed', { sessionId, state: 'paused' });
  }

  async stepOver(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    this.emit('step', { sessionId, type: 'over' });
  }

  async stepInto(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    this.emit('step', { sessionId, type: 'into' });
  }

  async stepOut(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión de debug no encontrada');
    }

    this.emit('step', { sessionId, type: 'out' });
  }

  getSession(sessionId: string): DebugSession | undefined {
    return this.sessions.get(sessionId);
  }

  getCurrentSession(): DebugSession | null {
    return this.currentSessionId ? this.sessions.get(this.currentSessionId) || null : null;
  }

  getAllSessions(): DebugSession[] {
    return Array.from(this.sessions.values());
  }

  private generateSessionId(): string {
    return `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBreakpointId(): string {
    return `bp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

