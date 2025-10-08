"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { X, ChevronDown, ChevronRight, FileText } from "lucide-react"
import { api } from "@/lib/api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"

interface DiffViewerProps {
  filePath: string
  onClose: () => void
}

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "header"
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export function DiffViewer({ filePath, onClose }: DiffViewerProps) {
  const [diff, setDiff] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [parsedDiff, setParsedDiff] = useState<DiffLine[]>([])
  const [showUnchanged, setShowUnchanged] = useState(false)

  useEffect(() => {
    loadDiff()
  }, [filePath])

  const loadDiff = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await api.gitDiff(filePath)
      if (response.success && response.data) {
        setDiff(response.data.diff)
        parseDiff(response.data.diff)
      } else {
        setError(response.error || "Error al cargar diff")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const parseDiff = (diffText: string) => {
    const lines = diffText.split('\n')
    const parsed: DiffLine[] = []
    let oldLineNum = 0
    let newLineNum = 0

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Header de chunk
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/)
        if (match) {
          oldLineNum = parseInt(match[1], 10)
          newLineNum = parseInt(match[2], 10)
          parsed.push({
            type: "header",
            content: line,
          })
        }
      } else if (line.startsWith('+')) {
        // Línea añadida
        parsed.push({
          type: "added",
          content: line.substring(1),
          newLineNumber: newLineNum++,
        })
      } else if (line.startsWith('-')) {
        // Línea eliminada
        parsed.push({
          type: "removed",
          content: line.substring(1),
          oldLineNumber: oldLineNum++,
        })
      } else if (line.startsWith(' ')) {
        // Línea sin cambios
        parsed.push({
          type: "unchanged",
          content: line.substring(1),
          oldLineNumber: oldLineNum++,
          newLineNumber: newLineNum++,
        })
      } else if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++')) {
        // Metadata - ignorar o mostrar como header
        continue
      }
    }

    setParsedDiff(parsed)
  }

  const getLineStyle = (type: DiffLine['type']) => {
    switch (type) {
      case "added":
        return "bg-green-500/20 border-l-2 border-green-500"
      case "removed":
        return "bg-red-500/20 border-l-2 border-red-500"
      case "header":
        return "bg-blue-500/10 text-blue-400 font-semibold"
      case "unchanged":
        return "bg-transparent"
      default:
        return ""
    }
  }

  const getLinePrefix = (type: DiffLine['type']) => {
    switch (type) {
      case "added":
        return "+"
      case "removed":
        return "-"
      case "unchanged":
        return " "
      default:
        return ""
    }
  }

  const filteredDiff = showUnchanged 
    ? parsedDiff 
    : parsedDiff.filter(line => line.type !== "unchanged")

  const stats = {
    added: parsedDiff.filter(l => l.type === "added").length,
    removed: parsedDiff.filter(l => l.type === "removed").length,
  }

  return (
    <div className="flex h-full flex-col border-t border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Cambios: {filePath}</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              +{stats.added}
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              -{stats.removed}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUnchanged(!showUnchanged)}
            className="text-xs"
          >
            {showUnchanged ? "Ocultar sin cambios" : "Mostrar sin cambios"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">Cargando diff...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : filteredDiff.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">Sin cambios</p>
          </div>
        ) : (
          <div className="font-mono text-xs">
            {filteredDiff.map((line, idx) => (
              <div
                key={idx}
                className={`flex px-4 py-0.5 ${getLineStyle(line.type)}`}
              >
                {/* Line numbers */}
                <div className="flex gap-2 mr-4 text-muted-foreground select-none">
                  <span className="w-10 text-right">
                    {line.oldLineNumber || ''}
                  </span>
                  <span className="w-10 text-right">
                    {line.newLineNumber || ''}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 whitespace-pre-wrap break-all">
                  {line.type !== "header" && (
                    <span className={
                      line.type === "added" ? "text-green-400" :
                      line.type === "removed" ? "text-red-400" :
                      "text-foreground"
                    }>
                      {getLinePrefix(line.type)}
                    </span>
                  )}
                  <span className={line.type === "header" ? "text-blue-400" : ""}>
                    {line.content}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Componente para mostrar múltiples archivos con diff
interface DiffViewerPanelProps {
  files: string[]
  onClose: () => void
}

export function DiffViewerPanel({ files, onClose }: DiffViewerPanelProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set(files.slice(0, 3)) // Expandir los primeros 3 por defecto
  )

  const toggleFile = (file: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(file)) {
      newExpanded.delete(file)
    } else {
      newExpanded.add(file)
    }
    setExpandedFiles(newExpanded)
  }

  const expandAll = () => {
    setExpandedFiles(new Set(files))
  }

  const collapseAll = () => {
    setExpandedFiles(new Set())
  }

  return (
    <div className="flex h-full flex-col border-t border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">
            Cambios ({files.length} archivo{files.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {files.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="text-xs"
              >
                Expandir todo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="text-xs"
              >
                Colapsar todo
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Files */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {files.map((file) => {
            const isExpanded = expandedFiles.has(file)
            
            return (
              <Collapsible
                key={file}
                open={isExpanded}
                onOpenChange={() => toggleFile(file)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span className="text-sm font-medium flex-1 text-left truncate">
                      {file}
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 border border-border rounded-md overflow-hidden">
                    <DiffViewer filePath={file} onClose={() => {}} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

