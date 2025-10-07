"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { X, Play, Save, Download, FileText, Search } from "lucide-react"
import { MonacoEditorWrapper as MonacoEditor } from "./monaco-editor-wrapper"
import { FindReplace, type FindOptions } from "./find-replace"
import { api } from "@/lib/api"

interface EditorAreaProps {
  activeFile: string | null
}

interface OpenFile {
  path: string
  content: string
  language: string
  isDirty: boolean // Indica si tiene cambios sin guardar
}

export function EditorArea({ activeFile }: EditorAreaProps) {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeTab, setActiveTab] = useState("")
  const [saving, setSaving] = useState(false)
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findMode, setFindMode] = useState<"find" | "replace">("find")

  // Abrir archivo cuando se selecciona
  useEffect(() => {
    if (activeFile && !openFiles.find(f => f.path === activeFile)) {
      loadFile(activeFile)
    } else if (activeFile) {
      setActiveTab(activeFile)
    }
  }, [activeFile])

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Guardar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveActiveFile()
      }
      // Ctrl+F: Abrir Find
      else if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !e.shiftKey) {
        e.preventDefault()
        setShowFindReplace(true)
        setFindMode("find")
      }
      // Ctrl+H: Abrir Find & Replace
      else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowFindReplace(true)
        setFindMode("replace")
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, openFiles])

  const loadFile = async (filePath: string) => {
    const response = await api.readFile(filePath)
    
    if (response.success && response.data) {
      const language = getLanguageFromPath(filePath)
      const newFile: OpenFile = {
        path: filePath,
        content: response.data.content,
        language,
        isDirty: false,
      }
      
      setOpenFiles(prev => [...prev, newFile])
      setActiveTab(filePath)
    } else {
      console.error('Error loading file:', response.error)
      // Si el archivo no existe, crear uno vacío
      const language = getLanguageFromPath(filePath)
      const newFile: OpenFile = {
        path: filePath,
        content: `// Nuevo archivo: ${filePath}\n`,
        language,
        isDirty: true,
      }
      setOpenFiles(prev => [...prev, newFile])
      setActiveTab(filePath)
    }
  }

  const handleContentChange = (path: string, newContent: string) => {
    setOpenFiles((files) => 
      files.map((file) => 
        file.path === path ? { ...file, content: newContent, isDirty: true } : file
      )
    )
  }

  const saveFile = async (filePath: string) => {
    setSaving(true)
    const file = openFiles.find(f => f.path === filePath)
    
    if (file) {
      const response = await api.writeFile(filePath, file.content)
      
      if (response.success) {
        setOpenFiles(files => 
          files.map(f => f.path === filePath ? { ...f, isDirty: false } : f)
        )
      } else {
        console.error('Error saving file:', response.error)
        alert(`Error al guardar: ${response.error}`)
      }
    }
    
    setSaving(false)
  }

  const saveActiveFile = () => {
    if (activeTab) {
      saveFile(activeTab)
    }
  }

  const handleCloseFile = (path: string) => {
    setOpenFiles((files) => {
      const newFiles = files.filter((f) => f.path !== path)
      if (activeTab === path && newFiles.length > 0) {
        setActiveTab(newFiles[0].path)
      }
      return newFiles
    })
  }

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      css: "css",
      html: "html",
      json: "json",
      md: "markdown",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
    }
    return languageMap[ext || ""] || "plaintext"
  }

  // Funciones de Find & Replace
  const handleFind = (query: string, options: FindOptions) => {
    const file = openFiles.find(f => f.path === activeTab)
    if (!file) return

    // Búsqueda simple en el contenido
    let searchFlags = options.caseSensitive ? "" : "gi"
    let pattern = options.regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    if (options.wholeWord) {
      pattern = `\\b${pattern}\\b`
    }

    try {
      const regex = new RegExp(pattern, searchFlags)
      const matches = file.content.match(regex)
      
      // TODO: Integrar con Monaco Editor para resaltar coincidencias
      console.log(`Encontradas ${matches?.length || 0} coincidencias para "${query}"`)
    } catch (error) {
      console.error("Error en la búsqueda:", error)
    }
  }

  const handleReplace = (query: string, replacement: string) => {
    const file = openFiles.find(f => f.path === activeTab)
    if (!file) return

    // Reemplazar la primera coincidencia
    const newContent = file.content.replace(new RegExp(query), replacement)
    handleContentChange(activeTab, newContent)
  }

  const handleReplaceAll = (query: string, replacement: string) => {
    const file = openFiles.find(f => f.path === activeTab)
    if (!file) return

    // Reemplazar todas las coincidencias
    const newContent = file.content.replace(new RegExp(query, 'g'), replacement)
    handleContentChange(activeTab, newContent)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#1e1e1e]">
      {/* Editor Toolbar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-secondary hover:text-secondary-foreground">
            <Play className="h-4 w-4" />
            Ejecutar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 hover:bg-secondary hover:text-secondary-foreground"
            onClick={saveActiveFile}
            disabled={saving || !openFiles.find(f => f.path === activeTab)?.isDirty}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 hover:bg-secondary hover:text-secondary-foreground"
            onClick={() => {
              setShowFindReplace(!showFindReplace)
              setFindMode("find")
            }}
            title="Buscar (Ctrl+F)"
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-secondary hover:text-secondary-foreground">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {openFiles.find(f => f.path === activeTab)?.isDirty && (
            <span className="text-xs text-orange-500">● Sin guardar</span>
          )}
          <div className="text-xs text-muted-foreground">{activeTab || "Sin archivo abierto"}</div>
        </div>
      </div>

      {/* Find & Replace Panel */}
      {showFindReplace && (
        <FindReplace
          mode={findMode}
          onFind={handleFind}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
          onClose={() => setShowFindReplace(false)}
        />
      )}

      {/* Tabs for open files */}
      {openFiles.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b border-border bg-transparent p-0">
            {openFiles.map((file) => (
              <TabsTrigger
                key={file.path}
                value={file.path}
                className="group relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-secondary/50"
              >
                <FileText className="mr-2 h-3 w-3" />
                <span className="flex items-center gap-1">
                  {file.isDirty && <span className="text-orange-500">●</span>}
                  {file.path.split("/").pop()}
                </span>
                <span
                  className="ml-2 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCloseFile(file.path)
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {openFiles.map((file) => (
            <TabsContent
              key={file.path}
              value={file.path}
              className="flex-1 min-h-0 p-0 m-0 data-[state=active]:flex overflow-hidden"
            >
              <MonacoEditor
                value={file.content}
                language={file.language}
                onChange={(newContent) => handleContentChange(file.path, newContent)}
                theme="vs-dark"
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-[#1e1e1e]">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-gray-100">Bienvenido a EduIDE</h3>
            <p className="text-sm text-gray-400">Selecciona un archivo del explorador para comenzar</p>
          </div>
        </div>
      )}
    </div>
  )
}
