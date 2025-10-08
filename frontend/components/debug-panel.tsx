"use client"

import { useState, useEffect } from "react"
import { 
  Play, 
  Pause, 
  Square, 
  StepOver, 
  StepInto, 
  StepOut, 
  Circle,
  RefreshCw,
  Bug,
  Eye,
  Plus,
  X,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { api } from "@/lib/api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"

interface DebugSession {
  sessionId: string
  file: string
  state: 'stopped' | 'running' | 'paused'
}

interface Breakpoint {
  id: string
  file: string
  line: number
  condition?: string
  enabled: boolean
}

interface DebugVariable {
  name: string
  value: string
  type: string
  expanded?: boolean
}

interface StackFrame {
  id: number
  name: string
  file: string
  line: number
}

interface DebugPanelProps {
  activeFile?: string | null
  onFileSelect?: (file: string, line?: number) => void
}

export function DebugPanel({ activeFile, onFileSelect }: DebugPanelProps) {
  const [session, setSession] = useState<DebugSession | null>(null)
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([])
  const [variables, setVariables] = useState<DebugVariable[]>([])
  const [callStack, setCallStack] = useState<StackFrame[]>([])
  const [watchExpressions, setWatchExpressions] = useState<string[]>([])
  const [newWatch, setNewWatch] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'variables' | 'watch' | 'call-stack'>('variables')

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    try {
      const response = await api.getDebugSession()
      if (response.success && response.data) {
        setSession(response.data)
        if (response.data.breakpoints) {
          const allBreakpoints: Breakpoint[] = []
          response.data.breakpoints.forEach((item: any) => {
            allBreakpoints.push(...item.breakpoints)
          })
          setBreakpoints(allBreakpoints)
        }
      }
    } catch (error) {
      console.error("Error loading debug session:", error)
    }
  }

  const handleStartDebug = async () => {
    if (!activeFile) {
      alert("Por favor, abre un archivo JavaScript o TypeScript primero")
      return
    }

    setLoading(true)
    try {
      const response = await api.startDebug(activeFile, [])
      if (response.success && response.data) {
        setSession({
          sessionId: response.data.sessionId,
          file: response.data.file,
          state: response.data.state
        })
      }
    } catch (error) {
      console.error("Error starting debug:", error)
      alert("Error al iniciar debug")
    } finally {
      setLoading(false)
    }
  }

  const handleStopDebug = async () => {
    if (!session) return

    setLoading(true)
    try {
      await api.stopDebug(session.sessionId)
      setSession(null)
      setBreakpoints([])
      setVariables([])
      setCallStack([])
    } catch (error) {
      console.error("Error stopping debug:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = async () => {
    if (!session) return

    try {
      await api.debugContinue(session.sessionId)
      setSession({ ...session, state: 'running' })
    } catch (error) {
      console.error("Error continuing:", error)
    }
  }

  const handlePause = async () => {
    if (!session) return

    try {
      await api.debugPause(session.sessionId)
      setSession({ ...session, state: 'paused' })
    } catch (error) {
      console.error("Error pausing:", error)
    }
  }

  const handleStepOver = async () => {
    if (!session) return

    try {
      await api.debugStepOver(session.sessionId)
    } catch (error) {
      console.error("Error stepping over:", error)
    }
  }

  const handleStepInto = async () => {
    if (!session) return

    try {
      await api.debugStepInto(session.sessionId)
    } catch (error) {
      console.error("Error stepping into:", error)
    }
  }

  const handleStepOut = async () => {
    if (!session) return

    try {
      await api.debugStepOut(session.sessionId)
    } catch (error) {
      console.error("Error stepping out:", error)
    }
  }

  const handleAddWatch = () => {
    if (newWatch.trim() && !watchExpressions.includes(newWatch.trim())) {
      setWatchExpressions([...watchExpressions, newWatch.trim()])
      setNewWatch("")
    }
  }

  const handleRemoveWatch = (expr: string) => {
    setWatchExpressions(watchExpressions.filter(e => e !== expr))
  }

  const handleBreakpointClick = (bp: Breakpoint) => {
    onFileSelect?.(bp.file, bp.line)
  }

  const handleStackFrameClick = (frame: StackFrame) => {
    onFileSelect?.(frame.file, frame.line)
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold">Depurador</span>
          {session && (
            <Badge variant={session.state === 'running' ? 'default' : 'secondary'}>
              {session.state === 'running' ? 'Ejecutando' : 
               session.state === 'paused' ? 'Pausado' : 'Detenido'}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSession}
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Debug Controls */}
      <div className="border-b border-border p-2">
        {!session ? (
          <Button
            onClick={handleStartDebug}
            disabled={loading || !activeFile}
            className="w-full"
            size="sm"
          >
            <Play className="mr-2 h-4 w-4" />
            Iniciar Depuración
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-1">
              {session.state === 'paused' ? (
                <Button
                  onClick={handleContinue}
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <Play className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={handleStepOver}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={session.state !== 'paused'}
                title="Step Over (F10)"
              >
                <StepOver className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleStepInto}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={session.state !== 'paused'}
                title="Step Into (F11)"
              >
                <StepInto className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleStepOut}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={session.state !== 'paused'}
                title="Step Out (Shift+F11)"
              >
                <StepOut className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleStopDebug}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
            {session.file && (
              <div className="text-xs text-muted-foreground truncate px-1">
                {session.file}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs">
        <button
          onClick={() => setActiveTab('variables')}
          className={`px-3 py-2 transition-colors ${
            activeTab === 'variables'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Variables
        </button>
        <button
          onClick={() => setActiveTab('watch')}
          className={`px-3 py-2 transition-colors ${
            activeTab === 'watch'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Watch
        </button>
        <button
          onClick={() => setActiveTab('call-stack')}
          className={`px-3 py-2 transition-colors ${
            activeTab === 'call-stack'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Call Stack
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {activeTab === 'variables' && (
            <div className="space-y-1">
              {variables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Eye className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {session ? 'Sin variables' : 'Inicia el depurador para ver variables'}
                  </p>
                </div>
              ) : (
                variables.map((variable, idx) => (
                  <VariableItem key={idx} variable={variable} />
                ))
              )}
            </div>
          )}

          {activeTab === 'watch' && (
            <div className="space-y-2">
              <div className="flex gap-1">
                <Input
                  placeholder="Agregar expresión..."
                  value={newWatch}
                  onChange={(e) => setNewWatch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWatch()}
                  className="h-7 text-xs"
                />
                <Button
                  onClick={handleAddWatch}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              {watchExpressions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Eye className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Sin expresiones watch
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {watchExpressions.map((expr, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between rounded p-1 text-xs hover:bg-accent"
                    >
                      <code className="flex-1">{expr}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWatch(expr)}
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'call-stack' && (
            <div className="space-y-1">
              {callStack.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bug className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {session ? 'Sin call stack' : 'Inicia el depurador para ver el call stack'}
                  </p>
                </div>
              ) : (
                callStack.map((frame) => (
                  <div
                    key={frame.id}
                    onClick={() => handleStackFrameClick(frame)}
                    className="cursor-pointer rounded p-2 text-xs hover:bg-accent"
                  >
                    <div className="font-medium">{frame.name}</div>
                    <div className="text-muted-foreground">
                      {frame.file}:{frame.line}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Breakpoints Section */}
      {breakpoints.length > 0 && (
        <>
          <Separator />
          <div className="border-t border-border">
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-accent">
                <span>Breakpoints ({breakpoints.length})</span>
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1 p-2">
                    {breakpoints.map((bp) => (
                      <div
                        key={bp.id}
                        onClick={() => handleBreakpointClick(bp)}
                        className="flex items-center gap-2 rounded p-1 text-xs hover:bg-accent cursor-pointer"
                      >
                        <Circle
                          className={`h-3 w-3 flex-shrink-0 ${
                            bp.enabled
                              ? 'fill-red-500 text-red-500'
                              : 'fill-gray-400 text-gray-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{bp.file}</div>
                          <div className="text-muted-foreground">Línea {bp.line}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </>
      )}
    </div>
  )
}

function VariableItem({ variable }: { variable: DebugVariable }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded hover:bg-accent">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 p-1 text-xs cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
        )}
        <span className="font-medium">{variable.name}:</span>
        <span className="text-muted-foreground truncate">{variable.value}</span>
        <Badge variant="outline" className="ml-auto text-[10px] h-4">
          {variable.type}
        </Badge>
      </div>
    </div>
  )
}

