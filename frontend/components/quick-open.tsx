"use client"

import { useEffect, useState, useCallback } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { FileText, Folder, FileCode, FileJson, File } from "lucide-react"

interface QuickOpenProps {
  files: string[]
  onFileSelect?: (path: string) => void
  recentFiles?: string[]
}

export function QuickOpen({ files, onFileSelect, recentFiles = [] }: QuickOpenProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Atajo Ctrl+P o Cmd+P
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Solo Ctrl+P (sin Shift)
      if ((e.ctrlKey || e.metaKey) && e.key === "p" && !e.shiftKey) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback((path: string) => {
    setOpen(false)
    setSearch("")
    onFileSelect?.(path)
  }, [onFileSelect])

  // Filtrar archivos basados en la búsqueda
  const filteredFiles = search
    ? files.filter((file) =>
        file.toLowerCase().includes(search.toLowerCase())
      )
    : files

  // Ordenar por relevancia (archivos recientes primero, luego alfabético)
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const aRecent = recentFiles.indexOf(a)
    const bRecent = recentFiles.indexOf(b)
    
    if (aRecent !== -1 && bRecent !== -1) {
      return aRecent - bRecent
    }
    if (aRecent !== -1) return -1
    if (bRecent !== -1) return 1
    
    return a.localeCompare(b)
  })

  // Obtener icono según extensión
  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase()
    
    switch (ext) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return FileCode
      case "json":
        return FileJson
      case "md":
      case "txt":
        return FileText
      default:
        return File
    }
  }

  // Obtener color según extensión
  const getFileColor = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase()
    
    switch (ext) {
      case "js":
      case "jsx":
        return "text-yellow-500"
      case "ts":
      case "tsx":
        return "text-blue-500"
      case "json":
        return "text-green-500"
      case "css":
        return "text-purple-500"
      case "html":
        return "text-orange-500"
      case "py":
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }

  // Resaltar coincidencias
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    
    const parts = text.split(new RegExp(`(${query})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar archivos..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center text-sm">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No se encontraron archivos</p>
            {search && (
              <p className="text-xs text-muted-foreground mt-2">
                Intenta con otro término de búsqueda
              </p>
            )}
          </div>
        </CommandEmpty>

        {recentFiles.length > 0 && !search && (
          <CommandGroup heading="Archivos Recientes">
            {recentFiles.slice(0, 5).map((file) => {
              const Icon = getFileIcon(file)
              const color = getFileColor(file)
              return (
                <CommandItem
                  key={`recent-${file}`}
                  value={file}
                  onSelect={() => handleSelect(file)}
                  className="gap-2"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="flex-1 truncate">{file}</span>
                  <span className="text-xs text-muted-foreground">Reciente</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        <CommandGroup heading={search ? "Resultados" : "Todos los Archivos"}>
          {sortedFiles.slice(0, 50).map((file) => {
            const Icon = getFileIcon(file)
            const color = getFileColor(file)
            const fileName = file.split("/").pop() || file
            const filePath = file.substring(0, file.length - fileName.length)
            
            return (
              <CommandItem
                key={file}
                value={file}
                onSelect={() => handleSelect(file)}
                className="gap-2"
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <div className="truncate">
                    {highlightMatch(fileName, search)}
                  </div>
                  {filePath && (
                    <div className="text-xs text-muted-foreground truncate">
                      {filePath}
                    </div>
                  )}
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>

        {sortedFiles.length > 50 && (
          <div className="py-2 text-center text-xs text-muted-foreground border-t">
            Mostrando 50 de {sortedFiles.length} resultados
          </div>
        )}
      </CommandList>
    </CommandDialog>
  )
}
