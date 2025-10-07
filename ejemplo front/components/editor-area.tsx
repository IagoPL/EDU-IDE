"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { X, Play, Save, Download, FileText } from "lucide-react"
import { MonacoEditor } from "./monaco-editor"

interface EditorAreaProps {
  activeFile: string | null
}

interface OpenFile {
  path: string
  content: string
  language: string
}

export function EditorArea({ activeFile }: EditorAreaProps) {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([
    {
      path: "src/index.js",
      content: `// Welcome to EduIDE
// This is a modern educational IDE

function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to EduIDE, \${name}!\`;
}

// Call the function
const message = greet("Student");
console.log(message);

// Try editing this code!
`,
      language: "javascript",
    },
  ])
  const [activeTab, setActiveTab] = useState(openFiles[0]?.path || "")

  const handleContentChange = (path: string, newContent: string) => {
    setOpenFiles((files) => files.map((file) => (file.path === path ? { ...file, content: newContent } : file)))
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

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#1e1e1e]">
      {/* Editor Toolbar */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-secondary hover:text-secondary-foreground">
            <Play className="h-4 w-4" />
            Ejecutar
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-secondary hover:text-secondary-foreground">
            <Save className="h-4 w-4" />
            Guardar
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-secondary hover:text-secondary-foreground">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">{activeTab || "Sin archivo abierto"}</div>
      </div>

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
                {file.path.split("/").pop()}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0 opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCloseFile(file.path)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
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
