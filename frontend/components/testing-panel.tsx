"use client"

import { useState, useEffect } from "react"
import {
  Play,
  RefreshCw,
  TestTube,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  Activity,
  Eye,
  BarChart3
} from "lucide-react"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Separator } from "./ui/separator"
import { api } from "@/lib/api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"

interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped' | 'pending'
  duration: number
  error?: string
  suite?: string
}

interface TestSuite {
  name: string
  file: string
  tests: TestResult[]
  duration: number
  passed: number
  failed: number
  skipped: number
  total: number
}

interface TestRunResult {
  framework: 'jest' | 'mocha' | 'pytest'
  suites: TestSuite[]
  totalTests: number
  passed: number
  failed: number
  skipped: number
  duration: number
}

interface TestingPanelProps {
  onFileSelect?: (file: string, line?: number) => void
}

export function TestingPanel({ onFileSelect }: TestingPanelProps) {
  const [framework, setFramework] = useState<'jest' | 'mocha' | 'pytest' | null>(null)
  const [testFiles, setTestFiles] = useState<string[]>([])
  const [results, setResults] = useState<TestRunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'tests' | 'coverage'>('tests')
  const [showCoverage, setShowCoverage] = useState(false)

  useEffect(() => {
    detectFramework()
  }, [])

  const detectFramework = async () => {
    setLoading(true)
    try {
      const response = await api.detectTestFramework()
      if (response.success && response.data) {
        setFramework(response.data.framework)
        if (response.data.framework) {
          discoverTests(response.data.framework)
        }
      }
    } catch (error) {
      console.error("Error detecting framework:", error)
    } finally {
      setLoading(false)
    }
  }

  const discoverTests = async (fw?: 'jest' | 'mocha' | 'pytest') => {
    try {
      const response = await api.discoverTests(fw)
      if (response.success && response.data) {
        setTestFiles(response.data.testFiles)
      }
    } catch (error) {
      console.error("Error discovering tests:", error)
    }
  }

  const runTests = async (coverage: boolean = false) => {
    if (!framework) {
      alert("No se detectó ningún framework de testing")
      return
    }

    setRunning(true)
    setResults(null)

    try {
      const response = await api.runAllTests(framework, coverage)
      if (response.success && response.data) {
        setResults(response.data)
        
        // Auto-expandir suites con fallos
        const failedSuites = response.data.suites
          .filter((s: TestSuite) => s.failed > 0)
          .map((s: TestSuite) => s.name)
        setExpandedSuites(new Set(failedSuites))
      }
    } catch (error) {
      console.error("Error running tests:", error)
      alert("Error al ejecutar tests")
    } finally {
      setRunning(false)
    }
  }

  const runTestFile = async (file: string) => {
    if (!framework) return

    setRunning(true)

    try {
      const response = await api.runTestFile(file, framework)
      if (response.success && response.data) {
        setResults(response.data)
      }
    } catch (error) {
      console.error("Error running test file:", error)
    } finally {
      setRunning(false)
    }
  }

  const toggleSuite = (suiteName: string) => {
    const newExpanded = new Set(expandedSuites)
    if (newExpanded.has(suiteName)) {
      newExpanded.delete(suiteName)
    } else {
      newExpanded.add(suiteName)
    }
    setExpandedSuites(newExpanded)
  }

  const expandAll = () => {
    if (results) {
      setExpandedSuites(new Set(results.suites.map(s => s.name)))
    }
  }

  const collapseAll = () => {
    setExpandedSuites(new Set())
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'skipped':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getFrameworkBadge = () => {
    if (!framework) return null
    
    const colors = {
      jest: 'bg-red-500/10 text-red-500 border-red-500/20',
      mocha: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      pytest: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }

    return (
      <Badge variant="outline" className={colors[framework]}>
        {framework.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <TestTube className="h-4 w-4 text-green-500" />
          <span className="text-sm font-semibold">Testing</span>
          {getFrameworkBadge()}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={detectFramework}
            disabled={loading}
            title="Detectar framework"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-border p-2 space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={() => runTests(false)}
            disabled={running || !framework}
            className="flex-1"
            size="sm"
          >
            <Play className="mr-2 h-4 w-4" />
            {running ? 'Ejecutando...' : 'Run All Tests'}
          </Button>
          <Button
            onClick={() => runTests(true)}
            disabled={running || !framework}
            variant="outline"
            size="sm"
            title="Run con coverage"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>

        {!framework && (
          <div className="text-xs text-muted-foreground text-center py-2">
            No se detectó ningún framework de testing
          </div>
        )}

        {framework && testFiles.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {testFiles.length} archivo{testFiles.length !== 1 ? 's' : ''} de test encontrado{testFiles.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Tabs */}
      {results && (
        <div className="flex border-b border-border text-xs">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-2 transition-colors ${
              activeTab === 'tests'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tests
          </button>
          {results.coverage && (
            <button
              onClick={() => setActiveTab('coverage')}
              className={`px-3 py-2 transition-colors ${
                activeTab === 'coverage'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Coverage
            </button>
          )}
        </div>
      )}

      {/* Results Summary */}
      {results && activeTab === 'tests' && (
        <div className="border-b border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                ✓ {results.passed}
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                ✗ {results.failed}
              </Badge>
              {results.skipped > 0 && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  ⊘ {results.skipped}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDuration(results.duration)}
            </span>
          </div>

          <Progress 
            value={(results.passed / results.totalTests) * 100} 
            className="h-2"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {results.passed}/{results.totalTests} tests pasaron
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="h-6 px-2 text-xs"
              >
                Expandir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="h-6 px-2 text-xs"
              >
                Colapsar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {activeTab === 'tests' && results && (
            <div className="space-y-2">
              {results.suites.map((suite) => {
                const isExpanded = expandedSuites.has(suite.name)

                return (
                  <Collapsible
                    key={suite.name}
                    open={isExpanded}
                    onOpenChange={() => toggleSuite(suite.name)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent group">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
                        <span className="text-sm font-medium flex-1 text-left truncate">
                          {suite.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {suite.passed > 0 && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">
                              {suite.passed}
                            </Badge>
                          )}
                          {suite.failed > 0 && (
                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500">
                              {suite.failed}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-1">
                        {suite.tests.map((test, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-md hover:bg-accent group"
                          >
                            {getStatusIcon(test.status)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm">{test.name}</div>
                              {test.error && (
                                <div className="mt-1 text-xs text-destructive font-mono bg-destructive/10 p-2 rounded">
                                  {test.error}
                                </div>
                              )}
                              {test.suite && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {test.suite}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(test.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          )}

          {activeTab === 'coverage' && results?.coverage && (
            <CoverageView coverage={results.coverage} />
          )}

          {!results && !running && framework && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TestTube className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-sm font-semibold">Listo para ejecutar tests</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Framework detectado: {framework.toUpperCase()}
              </p>
              <Button onClick={() => runTests(false)} size="sm">
                <Play className="mr-2 h-4 w-4" />
                Ejecutar Tests
              </Button>
            </div>
          )}

          {!framework && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TestTube className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-sm font-semibold">No hay framework de testing</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Instala Jest, Mocha o pytest en tu proyecto
              </p>
              <div className="space-y-2 text-left">
                <code className="block text-xs bg-muted p-2 rounded">
                  npm install --save-dev jest
                </code>
                <code className="block text-xs bg-muted p-2 rounded">
                  npm install --save-dev mocha chai
                </code>
                <code className="block text-xs bg-muted p-2 rounded">
                  pip install pytest
                </code>
              </div>
            </div>
          )}

          {running && (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="mb-4 h-12 w-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Ejecutando tests...</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Test Files List */}
      {testFiles.length > 0 && !results && !running && (
        <>
          <Separator />
          <div className="border-t border-border max-h-48">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
              Archivos de Test ({testFiles.length})
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-1 p-2">
                {testFiles.map((file) => (
                  <div
                    key={file}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-xs truncate">{file}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => runTestFile(file)}
                      className="h-6 px-2 opacity-0 group-hover:opacity-100"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  )
}

interface CoverageViewProps {
  coverage: any
}

function CoverageView({ coverage }: CoverageViewProps) {
  const metrics = [
    { name: 'Líneas', data: coverage.lines },
    { name: 'Statements', data: coverage.statements },
    { name: 'Funciones', data: coverage.functions },
    { name: 'Branches', data: coverage.branches },
  ]

  const getColorClass = (pct: number) => {
    if (pct >= 80) return 'text-green-500'
    if (pct >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-4">
      {/* Overall Coverage */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold mb-3">Cobertura General</h3>
        {metrics.map((metric) => (
          <div key={metric.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{metric.name}</span>
              <span className={`font-semibold ${getColorClass(metric.data.pct)}`}>
                {metric.data.pct.toFixed(1)}%
              </span>
            </div>
            <Progress value={metric.data.pct} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {metric.data.covered}/{metric.data.total}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Files Coverage */}
      {coverage.files && Object.keys(coverage.files).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Por Archivo</h3>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {Object.entries(coverage.files).map(([file, data]: [string, any]) => (
                <div key={file} className="rounded border border-border p-2">
                  <div className="text-xs font-medium truncate mb-2" title={file}>
                    {file.split('/').pop()}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Líneas: </span>
                      <span className={getColorClass(data.lines.pct)}>
                        {data.lines.pct.toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Functions: </span>
                      <span className={getColorClass(data.functions.pct)}>
                        {data.functions.pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

