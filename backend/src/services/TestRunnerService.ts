import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: string;
  suite?: string;
}

export interface TestSuite {
  name: string;
  file: string;
  tests: TestResult[];
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}

export interface TestRunResult {
  framework: 'jest' | 'mocha' | 'pytest';
  suites: TestSuite[];
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: CoverageReport;
}

export interface CoverageReport {
  lines: { total: number; covered: number; pct: number };
  statements: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
  files: {
    [file: string]: {
      lines: { pct: number };
      statements: { pct: number };
      functions: { pct: number };
      branches: { pct: number };
    };
  };
}

export class TestRunnerService extends EventEmitter {
  private workspacePath: string;

  constructor(workspacePath: string) {
    super();
    this.workspacePath = workspacePath;
  }

  /**
   * Detecta qué framework de testing está configurado en el proyecto
   */
  async detectTestFramework(): Promise<'jest' | 'mocha' | 'pytest' | null> {
    try {
      // Verificar package.json para Jest o Mocha
      const packageJsonPath = path.join(this.workspacePath, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        
        if (packageJson.devDependencies?.jest || packageJson.dependencies?.jest) {
          return 'jest';
        }
        
        if (packageJson.devDependencies?.mocha || packageJson.dependencies?.mocha) {
          return 'mocha';
        }
      }

      // Verificar requirements.txt para pytest
      const requirementsPath = path.join(this.workspacePath, 'requirements.txt');
      if (existsSync(requirementsPath)) {
        const requirements = readFileSync(requirementsPath, 'utf-8');
        if (requirements.includes('pytest')) {
          return 'pytest';
        }
      }

      return null;
    } catch (error) {
      console.error('Error detecting test framework:', error);
      return null;
    }
  }

  /**
   * Descubre archivos de test en el proyecto
   */
  async discoverTests(framework?: 'jest' | 'mocha' | 'pytest'): Promise<string[]> {
    const detectedFramework = framework || await this.detectTestFramework();
    const testFiles: string[] = [];

    if (!detectedFramework) {
      return testFiles;
    }

    const searchPatterns = this.getTestPatterns(detectedFramework);
    this.findTestFiles(this.workspacePath, searchPatterns, testFiles);

    return testFiles;
  }

  /**
   * Ejecuta todos los tests
   */
  async runAllTests(options: {
    framework?: 'jest' | 'mocha' | 'pytest';
    coverage?: boolean;
    watch?: boolean;
  } = {}): Promise<TestRunResult> {
    const framework = options.framework || await this.detectTestFramework();

    if (!framework) {
      throw new Error('No se detectó ningún framework de testing');
    }

    this.emit('test-run-start', { framework });

    try {
      let result: TestRunResult;

      switch (framework) {
        case 'jest':
          result = await this.runJest(options.coverage, options.watch);
          break;
        case 'mocha':
          result = await this.runMocha(options.coverage);
          break;
        case 'pytest':
          result = await this.runPytest(options.coverage);
          break;
        default:
          throw new Error(`Framework no soportado: ${framework}`);
      }

      this.emit('test-run-complete', result);
      return result;
    } catch (error) {
      this.emit('test-run-error', error);
      throw error;
    }
  }

  /**
   * Ejecuta un archivo de test específico
   */
  async runTestFile(file: string, framework?: 'jest' | 'mocha' | 'pytest'): Promise<TestRunResult> {
    const detectedFramework = framework || await this.detectTestFramework();

    if (!detectedFramework) {
      throw new Error('No se detectó ningún framework de testing');
    }

    this.emit('test-file-start', { file, framework: detectedFramework });

    try {
      let result: TestRunResult;

      switch (detectedFramework) {
        case 'jest':
          result = await this.runJest(false, false, file);
          break;
        case 'mocha':
          result = await this.runMocha(false, file);
          break;
        case 'pytest':
          result = await this.runPytest(false, file);
          break;
        default:
          throw new Error(`Framework no soportado: ${detectedFramework}`);
      }

      this.emit('test-file-complete', result);
      return result;
    } catch (error) {
      this.emit('test-file-error', error);
      throw error;
    }
  }

  /**
   * Ejecuta tests con Jest
   */
  private async runJest(coverage: boolean = false, watch: boolean = false, file?: string): Promise<TestRunResult> {
    const args = ['--json', '--testLocationInResults'];
    
    if (coverage) {
      args.push('--coverage', '--coverageReporters=json');
    }
    
    if (watch) {
      args.push('--watch');
    }
    
    if (file) {
      args.push(file);
    }

    const command = `npx jest ${args.join(' ')}`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workspacePath,
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });

      const result = JSON.parse(stdout);
      return this.parseJestResults(result);
    } catch (error: any) {
      // Jest retorna exit code 1 si hay tests fallidos, pero el output es válido
      if (error.stdout) {
        try {
          const result = JSON.parse(error.stdout);
          return this.parseJestResults(result);
        } catch (parseError) {
          throw new Error(`Error ejecutando Jest: ${error.message}`);
        }
      }
      throw new Error(`Error ejecutando Jest: ${error.message}`);
    }
  }

  /**
   * Ejecuta tests con Mocha
   */
  private async runMocha(coverage: boolean = false, file?: string): Promise<TestRunResult> {
    const args = ['--reporter', 'json'];
    
    if (file) {
      args.push(file);
    }

    let command = `npx mocha ${args.join(' ')}`;
    
    if (coverage) {
      command = `npx nyc --reporter=json ${command}`;
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workspacePath,
        maxBuffer: 10 * 1024 * 1024
      });

      const result = JSON.parse(stdout);
      return this.parseMochaResults(result);
    } catch (error: any) {
      if (error.stdout) {
        try {
          const result = JSON.parse(error.stdout);
          return this.parseMochaResults(result);
        } catch (parseError) {
          throw new Error(`Error ejecutando Mocha: ${error.message}`);
        }
      }
      throw new Error(`Error ejecutando Mocha: ${error.message}`);
    }
  }

  /**
   * Ejecuta tests con pytest
   */
  private async runPytest(coverage: boolean = false, file?: string): Promise<TestRunResult> {
    const args = ['--json-report', '--json-report-file=-'];
    
    if (coverage) {
      args.unshift('--cov', '--cov-report=json');
    }
    
    if (file) {
      args.push(file);
    }

    const command = `pytest ${args.join(' ')}`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workspacePath,
        maxBuffer: 10 * 1024 * 1024
      });

      const result = JSON.parse(stdout);
      return this.parsePytestResults(result);
    } catch (error: any) {
      if (error.stdout) {
        try {
          const result = JSON.parse(error.stdout);
          return this.parsePytestResults(result);
        } catch (parseError) {
          throw new Error(`Error ejecutando pytest: ${error.message}`);
        }
      }
      throw new Error(`Error ejecutando pytest: ${error.message}`);
    }
  }

  /**
   * Parsea resultados de Jest
   */
  private parseJestResults(jestOutput: any): TestRunResult {
    const suites: TestSuite[] = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalDuration = 0;

    if (jestOutput.testResults) {
      jestOutput.testResults.forEach((fileResult: any) => {
        const tests: TestResult[] = fileResult.assertionResults.map((test: any) => {
          const testResult: TestResult = {
            name: test.title,
            status: test.status === 'passed' ? 'passed' : 
                    test.status === 'failed' ? 'failed' : 'skipped',
            duration: test.duration || 0,
            suite: test.ancestorTitles?.join(' > ')
          };

          if (test.failureMessages && test.failureMessages.length > 0) {
            testResult.error = test.failureMessages.join('\n');
          }

          return testResult;
        });

        const passed = tests.filter(t => t.status === 'passed').length;
        const failed = tests.filter(t => t.status === 'failed').length;
        const skipped = tests.filter(t => t.status === 'skipped').length;

        suites.push({
          name: path.basename(fileResult.name),
          file: fileResult.name,
          tests,
          duration: fileResult.perfStats?.runtime || 0,
          passed,
          failed,
          skipped,
          total: tests.length
        });

        totalPassed += passed;
        totalFailed += failed;
        totalSkipped += skipped;
        totalDuration += fileResult.perfStats?.runtime || 0;
      });
    }

    return {
      framework: 'jest',
      suites,
      totalTests: totalPassed + totalFailed + totalSkipped,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      duration: totalDuration
    };
  }

  /**
   * Parsea resultados de Mocha
   */
  private parseMochaResults(mochaOutput: any): TestRunResult {
    const suites: TestSuite[] = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    if (mochaOutput.tests) {
      const testsBySuite = new Map<string, TestResult[]>();

      mochaOutput.tests.forEach((test: any) => {
        const suiteName = test.fullTitle?.split(' ')[0] || 'Default Suite';
        
        if (!testsBySuite.has(suiteName)) {
          testsBySuite.set(suiteName, []);
        }

        const testResult: TestResult = {
          name: test.title,
          status: test.state === 'passed' ? 'passed' :
                  test.state === 'failed' ? 'failed' : 'skipped',
          duration: test.duration || 0,
          suite: test.parent || suiteName
        };

        if (test.err) {
          testResult.error = test.err.message || JSON.stringify(test.err);
        }

        testsBySuite.get(suiteName)!.push(testResult);

        if (testResult.status === 'passed') totalPassed++;
        if (testResult.status === 'failed') totalFailed++;
        if (testResult.status === 'skipped') totalSkipped++;
      });

      testsBySuite.forEach((tests, suiteName) => {
        suites.push({
          name: suiteName,
          file: '', // Mocha no siempre proporciona el archivo
          tests,
          duration: tests.reduce((sum, t) => sum + t.duration, 0),
          passed: tests.filter(t => t.status === 'passed').length,
          failed: tests.filter(t => t.status === 'failed').length,
          skipped: tests.filter(t => t.status === 'skipped').length,
          total: tests.length
        });
      });
    }

    return {
      framework: 'mocha',
      suites,
      totalTests: totalPassed + totalFailed + totalSkipped,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      duration: mochaOutput.stats?.duration || 0
    };
  }

  /**
   * Parsea resultados de pytest
   */
  private parsePytestResults(pytestOutput: any): TestRunResult {
    const suites: TestSuite[] = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    if (pytestOutput.tests) {
      const testsBySuite = new Map<string, TestResult[]>();

      pytestOutput.tests.forEach((test: any) => {
        const suiteName = test.nodeid?.split('::')[0] || 'Default Suite';
        
        if (!testsBySuite.has(suiteName)) {
          testsBySuite.set(suiteName, []);
        }

        const testResult: TestResult = {
          name: test.nodeid?.split('::').pop() || test.name,
          status: test.outcome === 'passed' ? 'passed' :
                  test.outcome === 'failed' ? 'failed' : 'skipped',
          duration: test.duration || 0,
          suite: suiteName
        };

        if (test.call?.longrepr) {
          testResult.error = test.call.longrepr;
        }

        testsBySuite.get(suiteName)!.push(testResult);

        if (testResult.status === 'passed') totalPassed++;
        if (testResult.status === 'failed') totalFailed++;
        if (testResult.status === 'skipped') totalSkipped++;
      });

      testsBySuite.forEach((tests, suiteName) => {
        suites.push({
          name: path.basename(suiteName),
          file: suiteName,
          tests,
          duration: tests.reduce((sum, t) => sum + t.duration, 0),
          passed: tests.filter(t => t.status === 'passed').length,
          failed: tests.filter(t => t.status === 'failed').length,
          skipped: tests.filter(t => t.status === 'skipped').length,
          total: tests.length
        });
      });
    }

    return {
      framework: 'pytest',
      suites,
      totalTests: totalPassed + totalFailed + totalSkipped,
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      duration: pytestOutput.duration || 0
    };
  }

  /**
   * Obtiene patrones de búsqueda según el framework
   */
  private getTestPatterns(framework: 'jest' | 'mocha' | 'pytest'): RegExp[] {
    switch (framework) {
      case 'jest':
        return [
          /\.test\.(js|jsx|ts|tsx)$/,
          /\.spec\.(js|jsx|ts|tsx)$/,
          /__tests__\/.+\.(js|jsx|ts|tsx)$/
        ];
      case 'mocha':
        return [
          /\.test\.(js|ts)$/,
          /\.spec\.(js|ts)$/,
          /test\/.+\.(js|ts)$/
        ];
      case 'pytest':
        return [
          /test_.+\.py$/,
          /.+_test\.py$/,
          /tests\/.+\.py$/
        ];
    }
  }

  /**
   * Busca archivos de test recursivamente
   */
  private findTestFiles(dir: string, patterns: RegExp[], results: string[], basePath: string = '') {
    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = basePath ? `${basePath}/${entry}` : entry;

        // Ignorar node_modules y carpetas comunes
        if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') {
          continue;
        }

        try {
          const stats = statSync(fullPath);

          if (stats.isDirectory()) {
            this.findTestFiles(fullPath, patterns, results, relativePath);
          } else if (stats.isFile()) {
            // Verificar si coincide con algún patrón de test
            if (patterns.some(pattern => pattern.test(entry))) {
              results.push(relativePath);
            }
          }
        } catch (statError) {
          // Ignorar archivos con errores de permisos
        }
      }
    } catch (dirError) {
      // Ignorar directorios con errores de permisos
    }
  }

  /**
   * Obtiene coverage si está disponible
   */
  async getCoverage(): Promise<CoverageReport | null> {
    const coveragePath = path.join(this.workspacePath, 'coverage', 'coverage-final.json');
    
    if (!existsSync(coveragePath)) {
      return null;
    }

    try {
      const coverageData = JSON.parse(readFileSync(coveragePath, 'utf-8'));
      return this.parseCoverage(coverageData);
    } catch (error) {
      console.error('Error reading coverage:', error);
      return null;
    }
  }

  /**
   * Parsea datos de cobertura
   */
  private parseCoverage(coverageData: any): CoverageReport {
    let totalLines = 0;
    let coveredLines = 0;
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalBranches = 0;
    let coveredBranches = 0;

    const files: CoverageReport['files'] = {};

    Object.entries(coverageData).forEach(([file, data]: [string, any]) => {
      // Agregar a totales
      totalLines += data.l?.total || 0;
      coveredLines += data.l?.covered || 0;
      totalStatements += data.s?.total || 0;
      coveredStatements += data.s?.covered || 0;
      totalFunctions += data.f?.total || 0;
      coveredFunctions += data.f?.covered || 0;
      totalBranches += data.b?.total || 0;
      coveredBranches += data.b?.covered || 0;

      // Datos por archivo
      files[file] = {
        lines: { pct: data.l?.pct || 0 },
        statements: { pct: data.s?.pct || 0 },
        functions: { pct: data.f?.pct || 0 },
        branches: { pct: data.b?.pct || 0 }
      };
    });

    return {
      lines: {
        total: totalLines,
        covered: coveredLines,
        pct: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
      },
      statements: {
        total: totalStatements,
        covered: coveredStatements,
        pct: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
      },
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        pct: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        pct: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0
      },
      files
    };
  }

  setWorkspace(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  getWorkspacePath(): string {
    return this.workspacePath;
  }
}

