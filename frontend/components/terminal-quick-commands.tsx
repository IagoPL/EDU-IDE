"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Zap, Copy, Play } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface CommandSnippet {
  command: string
  description: string
}

interface TerminalQuickCommandsProps {
  shellId?: string
  onExecute: (command: string) => void
}

export function TerminalQuickCommands({ shellId, onExecute }: TerminalQuickCommandsProps) {
  const [snippets, setSnippets] = useState<{ [key: string]: CommandSnippet }>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (shellId) {
      loadSnippets(shellId)
    }
  }, [shellId])

  const loadSnippets = async (id: string) => {
    setLoading(true)
    try {
      const response = await api.getShellSnippets(id)
      if (response.success && response.data) {
        setSnippets(response.data.snippets)
      }
    } catch (error) {
      console.error("Error loading snippets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      toast({
        title: "Copiado",
        description: "Comando copiado al portapapeles",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar",
        variant: "destructive"
      })
    }
  }

  const handleExecute = (command: string) => {
    onExecute(command)
    toast({
      title: "Comando ejecutado",
      description: command,
    })
  }

  if (Object.keys(snippets).length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">
        <Zap className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>Sin comandos rápidos para este shell</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-2">
        <div className="flex items-center gap-2 px-2 mb-3">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-xs font-semibold">Comandos Rápidos</span>
          <Badge variant="secondary" className="text-xs">
            {Object.keys(snippets).length}
          </Badge>
        </div>

        {Object.entries(snippets).map(([key, snippet]) => (
          <div
            key={key}
            className="group rounded-md border border-border p-2 hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium mb-0.5">{key}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {snippet.description}
                </div>
              </div>
            </div>

            <code className="block text-xs bg-muted/50 p-2 rounded mt-2 mb-2 font-mono overflow-x-auto">
              {snippet.command}
            </code>

            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExecute(snippet.command)}
                className="h-6 flex-1 text-xs gap-1"
              >
                <Play className="h-3 w-3" />
                Ejecutar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(snippet.command)}
                className="h-6 px-2"
                title="Copiar"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

