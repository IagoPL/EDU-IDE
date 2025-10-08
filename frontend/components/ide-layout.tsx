"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { EditorArea } from "./editor-area"
import { RightPanel } from "./right-panel"
import { Toolbar } from "./toolbar"
import { StatusBar } from "./status-bar"
import { CommandPalette } from "./command-palette"
import { QuickOpen } from "./quick-open"
import { TerminalPanel } from "./terminal-panel"
import { api } from "@/lib/api"

// Tipos para el árbol de archivos
interface FileTreeNode {
  name: string
  type: "file" | "directory"
  children?: FileTreeNode[]
}

export function IDELayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [allFiles, setAllFiles] = useState<string[]>([])
  const [recentFiles, setRecentFiles] = useState<string[]>([])
  const [workspaceKey, setWorkspaceKey] = useState(0) // Key para forzar re-render

  // Cargar lista de todos los archivos para Quick Open
  useEffect(() => {
    loadAllFiles()
  }, [workspaceKey]) // Recargar cuando cambie el workspace

  const handleWorkspaceChanged = () => {
    // Incrementar el key para forzar re-render del sidebar y recargar archivos
    setWorkspaceKey(prev => prev + 1)
    setActiveFile(null) // Cerrar archivo activo
    setAllFiles([])
    setRecentFiles([])
    loadAllFiles()
  }

  const loadAllFiles = async () => {
    const response = await api.getFileTree()
    if (response.success && response.data) {
      // Extraer todos los paths de archivos del árbol
      const files = extractFilePaths(response.data)
      setAllFiles(files)
    }
  }

  const extractFilePaths = (nodes: FileTreeNode[], basePath: string = ""): string[] => {
    let paths: string[] = []
    
    for (const node of nodes) {
      const fullPath = basePath ? `${basePath}/${node.name}` : node.name
      
      if (node.type === "file") {
        paths.push(fullPath)
      }
      
      if (node.children && node.children.length > 0) {
        paths = paths.concat(extractFilePaths(node.children, fullPath))
      }
    }
    
    return paths
  }

  const handleFileOpen = (path: string) => {
    setActiveFile(path)
    
    // Agregar a archivos recientes
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f !== path)
      return [path, ...filtered].slice(0, 10) // Mantener solo los últimos 10
    })
  }

  const handleCommand = (command: string) => {
    // Implementar acciones de comandos
    switch (command) {
      case "file.new":
        // TODO: Implementar crear archivo
        break
      case "file.save":
        // TODO: Implementar guardar
        break
      case "view.terminal":
        setTerminalOpen(true)
        break
      case "view.explorer":
        setSidebarOpen(true)
        break
      case "view.search":
        setRightPanelOpen(true)
        break
      case "editor.goToDefinition":
        // Monaco maneja esto nativamente con F12
        break
      case "editor.findReferences":
        // Monaco maneja esto nativamente con Shift+F12
        break
      case "editor.formatDocument":
        // Monaco maneja esto nativamente con Shift+Alt+F
        break
      case "editor.renameSymbol":
        // Monaco maneja esto nativamente con F2
        break
      case "editor.quickFix":
        // Monaco maneja esto nativamente con Ctrl+.
        break
      // ... más comandos
    }
  }

  // Atajo para abrir búsqueda (Ctrl+Shift+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setRightPanelOpen(true)
        // Focus en el tab de búsqueda
        setTimeout(() => {
          const searchTab = document.querySelector('[value="search"]') as HTMLElement
          searchTab?.click()
        }, 100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
      {/* Command Palette - Ctrl+Shift+P */}
      <CommandPalette
        onFileOpen={handleFileOpen}
        onCommand={handleCommand}
        recentFiles={recentFiles}
      />

      {/* Quick Open - Ctrl+P */}
      <QuickOpen
        files={allFiles}
        onFileSelect={handleFileOpen}
        recentFiles={recentFiles}
      />

      {/* Toolbar */}
      <Toolbar
        sidebarOpen={sidebarOpen}
        rightPanelOpen={rightPanelOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
        onWorkspaceChanged={handleWorkspaceChanged}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden flex-col">
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar */}
          {sidebarOpen && (
            <div className="w-64 flex-shrink-0 border-r border-border">
              <Sidebar key={workspaceKey} activeFile={activeFile} onFileSelect={handleFileOpen} />
            </div>
          )}

          {/* Editor Area - takes remaining space */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <EditorArea activeFile={activeFile} />
          </div>

          {/* Right Panel */}
          {rightPanelOpen && (
            <div className="w-80 flex-shrink-0 border-l border-border">
              <RightPanel onFileSelect={handleFileOpen} activeFile={activeFile} />
            </div>
          )}
        </div>

        {/* Terminal Panel */}
        {terminalOpen && (
          <div className="h-64 flex-shrink-0">
            <TerminalPanel onClose={() => setTerminalOpen(false)} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar activeFile={activeFile} terminalOpen={terminalOpen} onToggleTerminal={() => setTerminalOpen(!terminalOpen)} />
    </div>
  )
}
