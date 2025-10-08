"use client"

import { useState, useEffect } from "react"
import { Terminal } from "./terminal"
import { Button } from "./ui/button"
import { Plus, X, ChevronDown, Zap, Terminal as TerminalIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { api } from "@/lib/api"

interface ShellInfo {
  id: string
  name: string
  command: string
  args: string[]
  available: boolean
  version?: string
  icon: string
  description: string
  category: 'system' | 'bash' | 'wsl' | 'custom'
}

interface TerminalTab {
  id: string
  title: string
  shellId?: string
  shellName?: string
}

interface TerminalPanelProps {
  onClose?: () => void
}

export function TerminalPanel({ onClose }: TerminalPanelProps) {
  const [terminals, setTerminals] = useState<TerminalTab[]>([
    { id: "terminal-1", title: "Terminal 1" }
  ])
  const [activeTerminal, setActiveTerminal] = useState("terminal-1")
  const [availableShells, setAvailableShells] = useState<ShellInfo[]>([])
  const [defaultShell, setDefaultShell] = useState<ShellInfo | null>(null)

  useEffect(() => {
    loadAvailableShells()
  }, [])

  const loadAvailableShells = async () => {
    try {
      const response = await api.getAvailableShells()
      if (response.success && response.data) {
        setAvailableShells(response.data.shells)
        
        // Cargar shell por defecto
        const defaultResponse = await api.getDefaultShell()
        if (defaultResponse.success && defaultResponse.data) {
          setDefaultShell(defaultResponse.data.shell)
        }
      }
    } catch (error) {
      console.error("Error loading shells:", error)
    }
  }

  const handleCommand = async (terminalId: string, command: string) => {
    try {
      const response = await api.executeCommand(command, terminalId)
      
      if (!response.success) {
        // Manejar error silenciosamente o mostrar en UI
        // El terminal mostrará el error en su output
      }
    } catch (error) {
      // Error de red o servidor
      // El terminal debe mostrar el error en su output
    }
  }

  const addTerminal = (shellInfo?: ShellInfo) => {
    const newId = `terminal-${terminals.length + 1}`
    const shell = shellInfo || defaultShell
    const newTerminal: TerminalTab = {
      id: newId,
      title: shell ? `${shell.icon} ${shell.name} ${terminals.length + 1}` : `Terminal ${terminals.length + 1}`,
      shellId: shell?.id,
      shellName: shell?.name
    }
    
    setTerminals([...terminals, newTerminal])
    setActiveTerminal(newId)
  }

  const closeTerminal = (id: string) => {
    const newTerminals = terminals.filter(t => t.id !== id)
    
    if (newTerminals.length === 0) {
      // Si no quedan terminales, cerrar el panel
      onClose?.()
    } else {
      setTerminals(newTerminals)
      
      // Si cerramos la terminal activa, activar la primera
      if (activeTerminal === id) {
        setActiveTerminal(newTerminals[0].id)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Terminal</span>
          
          {/* Dropdown para seleccionar tipo de shell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 px-2 text-xs"
              >
                <Plus className="h-3 w-3" />
                Nueva
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs">Tipo de Terminal</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {availableShells.length === 0 ? (
                <DropdownMenuItem onClick={() => addTerminal()}>
                  <TerminalIcon className="mr-2 h-4 w-4" />
                  Terminal por Defecto
                </DropdownMenuItem>
              ) : (
                availableShells.map((shell) => (
                  <DropdownMenuItem 
                    key={shell.id} 
                    onClick={() => addTerminal(shell)}
                  >
                    <span className="mr-2">{shell.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{shell.name}</div>
                      {shell.version && (
                        <div className="text-xs text-muted-foreground">{shell.version}</div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={loadAvailableShells}>
                <Zap className="mr-2 h-4 w-4" />
                Redetectar Shells
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTerminal} onValueChange={setActiveTerminal} className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
          {terminals.map((terminal) => (
            <TabsTrigger
              key={terminal.id}
              value={terminal.id}
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-secondary/50 group"
            >
              <span className="text-xs">{terminal.title}</span>
              {terminals.length > 1 && (
                <span
                  className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-sm opacity-0 hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTerminal(terminal.id)
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {terminals.map((terminal) => (
          <TabsContent
            key={terminal.id}
            value={terminal.id}
            className="flex-1 min-h-0 p-0 m-0 data-[state=active]:flex"
          >
            <Terminal
              onCommand={(cmd) => handleCommand(terminal.id, cmd)}
              title={terminal.title}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
