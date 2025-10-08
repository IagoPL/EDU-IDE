export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'code' | 'git' | 'testing' | 'debugging' | 'learning';
  requirement: number;
  unlocked: boolean;
  progress: number;
  unlockedAt?: number;
}

export interface LanguageProgress {
  language: string;
  linesWritten: number;
  filesCreated: number;
  timeSpent: number; // en minutos
  lastActive: number; // timestamp
  level: number;
  experience: number;
}

export interface UserProgress {
  userId: string;
  achievements: Achievement[];
  languages: LanguageProgress[];
  totalLinesWritten: number;
  totalFilesCreated: number;
  totalTimeSpent: number;
  joinedAt: number;
  lastActive: number;
}

export class ProgressService {
  private achievements: Achievement[] = [];
  private userProgress: Map<string, UserProgress> = new Map();

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements() {
    // Achievements de Código
    this.achievements.push({
      id: 'first-line',
      title: 'Primeros Pasos',
      description: 'Escribe tu primera línea de código',
      icon: '✍️',
      category: 'code',
      requirement: 1,
      unlocked: false,
      progress: 0
    });

    this.achievements.push({
      id: 'hundred-lines',
      title: 'Escritor de Código',
      description: 'Escribe 100 líneas de código',
      icon: '📝',
      category: 'code',
      requirement: 100,
      unlocked: false,
      progress: 0
    });

    this.achievements.push({
      id: 'thousand-lines',
      title: 'Maestro del Código',
      description: 'Escribe 1,000 líneas de código',
      icon: '🏆',
      category: 'code',
      requirement: 1000,
      unlocked: false,
      progress: 0
    });

    // Achievements de Git
    this.achievements.push({
      id: 'first-commit',
      title: 'Primera Confirmación',
      description: 'Realiza tu primer commit',
      icon: '📦',
      category: 'git',
      requirement: 1,
      unlocked: false,
      progress: 0
    });

    this.achievements.push({
      id: 'git-master',
      title: 'Maestro de Git',
      description: 'Realiza 50 commits',
      icon: '🎯',
      category: 'git',
      requirement: 50,
      unlocked: false,
      progress: 0
    });

    // Achievements de Testing
    this.achievements.push({
      id: 'first-test',
      title: 'Tester Novato',
      description: 'Ejecuta tu primer test',
      icon: '🧪',
      category: 'testing',
      requirement: 1,
      unlocked: false,
      progress: 0
    });

    this.achievements.push({
      id: 'hundred-tests',
      title: 'Asegurador de Calidad',
      description: 'Pasa 100 tests exitosamente',
      icon: '✅',
      category: 'testing',
      requirement: 100,
      unlocked: false,
      progress: 0
    });

    // Achievements de Debugging
    this.achievements.push({
      id: 'first-debug',
      title: 'Detective de Bugs',
      description: 'Inicia tu primera sesión de debugging',
      icon: '🐛',
      category: 'debugging',
      requirement: 1,
      unlocked: false,
      progress: 0
    });

    // Achievements de Aprendizaje
    this.achievements.push({
      id: 'polyglot',
      title: 'Políglota',
      description: 'Programa en 5 lenguajes diferentes',
      icon: '🌍',
      category: 'learning',
      requirement: 5,
      unlocked: false,
      progress: 0
    });

    this.achievements.push({
      id: 'dedicated',
      title: 'Dedicado',
      description: 'Programa por 10 horas totales',
      icon: '⏰',
      category: 'learning',
      requirement: 600, // 10 horas en minutos
      unlocked: false,
      progress: 0
    });
  }

  /**
   * Obtiene o crea progreso de usuario
   */
  getUserProgress(userId: string = 'default'): UserProgress {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        achievements: [...this.achievements],
        languages: [],
        totalLinesWritten: 0,
        totalFilesCreated: 0,
        totalTimeSpent: 0,
        joinedAt: Date.now(),
        lastActive: Date.now()
      });
    }

    return this.userProgress.get(userId)!;
  }

  /**
   * Registra líneas escritas en un lenguaje
   */
  trackLinesWritten(userId: string, language: string, lines: number) {
    const progress = this.getUserProgress(userId);
    
    // Actualizar lenguaje específico
    let langProgress = progress.languages.find(l => l.language === language);
    if (!langProgress) {
      langProgress = {
        language,
        linesWritten: 0,
        filesCreated: 0,
        timeSpent: 0,
        lastActive: Date.now(),
        level: 1,
        experience: 0
      };
      progress.languages.push(langProgress);
    }

    langProgress.linesWritten += lines;
    langProgress.experience += lines * 10; // 10 XP por línea
    langProgress.level = Math.floor(langProgress.experience / 1000) + 1;
    langProgress.lastActive = Date.now();

    // Actualizar totales
    progress.totalLinesWritten += lines;
    progress.lastActive = Date.now();

    // Verificar achievements
    this.checkAchievements(userId);

    return progress;
  }

  /**
   * Registra archivo creado
   */
  trackFileCreated(userId: string, language: string) {
    const progress = this.getUserProgress(userId);
    
    let langProgress = progress.languages.find(l => l.language === language);
    if (!langProgress) {
      langProgress = {
        language,
        linesWritten: 0,
        filesCreated: 0,
        timeSpent: 0,
        lastActive: Date.now(),
        level: 1,
        experience: 0
      };
      progress.languages.push(langProgress);
    }

    langProgress.filesCreated += 1;
    langProgress.experience += 50; // 50 XP por archivo
    langProgress.level = Math.floor(langProgress.experience / 1000) + 1;

    progress.totalFilesCreated += 1;
    progress.lastActive = Date.now();

    this.checkAchievements(userId);

    return progress;
  }

  /**
   * Registra tiempo de programación
   */
  trackTimeSpent(userId: string, language: string, minutes: number) {
    const progress = this.getUserProgress(userId);
    
    let langProgress = progress.languages.find(l => l.language === language);
    if (langProgress) {
      langProgress.timeSpent += minutes;
    }

    progress.totalTimeSpent += minutes;
    progress.lastActive = Date.now();

    this.checkAchievements(userId);

    return progress;
  }

  /**
   * Registra evento (commit, test, debug, etc.)
   */
  trackEvent(userId: string, event: {
    type: 'commit' | 'test' | 'debug';
    count?: number;
  }) {
    const progress = this.getUserProgress(userId);
    const count = event.count || 1;

    // Encontrar achievement relevante y actualizar progreso
    progress.achievements.forEach(achievement => {
      if (event.type === 'commit' && achievement.category === 'git') {
        achievement.progress += count;
      } else if (event.type === 'test' && achievement.category === 'testing') {
        achievement.progress += count;
      } else if (event.type === 'debug' && achievement.category === 'debugging') {
        achievement.progress += count;
      }
    });

    this.checkAchievements(userId);

    return progress;
  }

  /**
   * Verifica y desbloquea achievements
   */
  private checkAchievements(userId: string) {
    const progress = this.getUserProgress(userId);
    const newlyUnlocked: Achievement[] = [];

    progress.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        // Verificar según categoría
        if (achievement.category === 'code') {
          if (achievement.id === 'first-line') {
            achievement.progress = progress.totalLinesWritten;
          } else if (achievement.id.includes('lines')) {
            achievement.progress = progress.totalLinesWritten;
          }
        } else if (achievement.category === 'learning') {
          if (achievement.id === 'polyglot') {
            achievement.progress = progress.languages.length;
          } else if (achievement.id === 'dedicated') {
            achievement.progress = progress.totalTimeSpent;
          }
        }

        // Desbloquear si se cumple el requisito
        if (achievement.progress >= achievement.requirement) {
          achievement.unlocked = true;
          achievement.unlockedAt = Date.now();
          newlyUnlocked.push(achievement);
        }
      }
    });

    return newlyUnlocked;
  }

  /**
   * Obtiene achievements desbloqueados
   */
  getUnlockedAchievements(userId: string = 'default'): Achievement[] {
    const progress = this.getUserProgress(userId);
    return progress.achievements.filter(a => a.unlocked);
  }

  /**
   * Obtiene achievements pendientes
   */
  getPendingAchievements(userId: string = 'default'): Achievement[] {
    const progress = this.getUserProgress(userId);
    return progress.achievements.filter(a => !a.unlocked);
  }

  /**
   * Obtiene progreso por lenguaje
   */
  getLanguageProgress(userId: string = 'default'): LanguageProgress[] {
    const progress = this.getUserProgress(userId);
    return progress.languages.sort((a, b) => b.experience - a.experience);
  }

  /**
   * Obtiene estadísticas generales
   */
  getStats(userId: string = 'default') {
    const progress = this.getUserProgress(userId);
    
    return {
      totalLinesWritten: progress.totalLinesWritten,
      totalFilesCreated: progress.totalFilesCreated,
      totalTimeSpent: progress.totalTimeSpent,
      languagesUsed: progress.languages.length,
      achievementsUnlocked: progress.achievements.filter(a => a.unlocked).length,
      achievementsTotal: progress.achievements.length,
      joinedAt: progress.joinedAt,
      lastActive: progress.lastActive
    };
  }
}

