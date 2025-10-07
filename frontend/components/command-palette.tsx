"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  FileText,
  FolderOpen,
  Search,
  Settings,
  Terminal,
  GitBranch,
  Play,
  Save,
  FileCode,
  Palette,
  Zap,
} from "lucide-react"

interface CommandPaletteProps {
  onFileOpen?: (path: string) => void
  onCommand?: (command: string) => void
  recentFiles?: string[]
}

export function CommandPalette({ onFileOpen, onCommand, recentFiles = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)

  // Atajo Ctrl+Shift+P o Cmd+Shift+P
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "p") {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false)
    callback()
  }, [])

  const commands = [
    {
      group: "Archivo",
      items: [
        {
          icon: FileText,
          label: "Nuevo Archivo",
          shortcut: "Ctrl+N",
          onSelect: () => handleSelect(() => onCommand?.("file.new")),
        },
        {
          icon: FolderOpen,
          label: "Abrir Archivo",
          shortcut: "Ctrl+O",
          onSelect: () => handleSelect(() => onCommand?.("file.open")),
        },
        {
          icon: Save,
          label: "Guardar",
          shortcut: "Ctrl+S",
          onSelect: () => handleSelect(() => onCommand?.("file.save")),
        },
        {
          icon: Save,
          label: "Guardar Todo",
          shortcut: "Ctrl+K S",
          onSelect: () => handleSelect(() => onCommand?.("file.saveAll")),
        },
      ],
    },
    {
      group: "Edición",
      items: [
        {
          icon: Search,
          label: "Buscar en Archivo",
          shortcut: "Ctrl+F",
          onSelect: () => handleSelect(() => onCommand?.("edit.find")),
        },
        {
          icon: Search,
          label: "Buscar y Reemplazar",
          shortcut: "Ctrl+H",
          onSelect: () => handleSelect(() => onCommand?.("edit.replace")),
        },
        {
          icon: Search,
          label: "Buscar en Archivos",
          shortcut: "Ctrl+Shift+F",
          onSelect: () => handleSelect(() => onCommand?.("edit.findInFiles")),
        },
        {
          icon: FileCode,
          label: "Ir a Línea",
          shortcut: "Ctrl+G",
          onSelect: () => handleSelect(() => onCommand?.("edit.gotoLine")),
        },
      ],
    },
    {
      group: "Vista",
      items: [
        {
          icon: Terminal,
          label: "Mostrar Terminal",
          shortcut: "Ctrl+`",
          onSelect: () => handleSelect(() => onCommand?.("view.terminal")),
        },
        {
          icon: FolderOpen,
          label: "Explorador de Archivos",
          shortcut: "Ctrl+Shift+E",
          onSelect: () => handleSelect(() => onCommand?.("view.explorer")),
        },
        {
          icon: Search,
          label: "Panel de Búsqueda",
          shortcut: "Ctrl+Shift+F",
          onSelect: () => handleSelect(() => onCommand?.("view.search")),
        },
        {
          icon: GitBranch,
          label: "Control de Versiones",
          shortcut: "Ctrl+Shift+G",
          onSelect: () => handleSelect(() => onCommand?.("view.git")),
        },
      ],
    },
    {
      group: "Ejecutar",
      items: [
        {
          icon: Play,
          label: "Ejecutar Archivo",
          shortcut: "F5",
          onSelect: () => handleSelect(() => onCommand?.("run.file")),
        },
        {
          icon: Play,
          label: "Ejecutar sin Depurar",
          shortcut: "Ctrl+F5",
          onSelect: () => handleSelect(() => onCommand?.("run.withoutDebug")),
        },
        {
          icon: Zap,
          label: "Ejecutar Tarea",
          shortcut: "",
          onSelect: () => handleSelect(() => onCommand?.("run.task")),
        },
      ],
    },
    {
      group: "Configuración",
      items: [
        {
          icon: Settings,
          label: "Configuración",
          shortcut: "Ctrl+,",
          onSelect: () => handleSelect(() => onCommand?.("settings.open")),
        },
        {
          icon: Palette,
          label: "Tema de Color",
          shortcut: "",
          onSelect: () => handleSelect(() => onCommand?.("settings.theme")),
        },
        {
          icon: FileCode,
          label: "Atajos de Teclado",
          shortcut: "Ctrl+K Ctrl+S",
          onSelect: () => handleSelect(() => onCommand?.("settings.shortcuts")),
        },
      ],
    },
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Escribe un comando o busca..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        
        {recentFiles.length > 0 && (
          <>
            <CommandGroup heading="Archivos Recientes">
              {recentFiles.slice(0, 5).map((file) => (
                <CommandItem
                  key={file}
                  onSelect={() => handleSelect(() => onFileOpen?.(file))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{file}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {commands.map((group, index) => (
          <div key={group.group}>
            <CommandGroup heading={group.group}>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem key={item.label} onSelect={item.onSelect}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-xs text-muted-foreground">
                        {item.shortcut}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {index < commands.length - 1 && <CommandSeparator />}
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  )
}

