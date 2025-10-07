"use client"

import { useState, useEffect } from "react"
import { FileType as FileTree, FolderOpen, Search, GitBranch, Settings, RefreshCw, Plus, FolderPlus } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { api, FileNode } from "@/lib/api"

interface SidebarProps {
  activeFile: string | null
  onFileSelect: (file: string) => void
}

type SidebarTab = "explorer" | "search" | "git" | "settings"

export function Sidebar({ activeFile, onFileSelect }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("explorer")

  const tabs = [
    { id: "explorer" as SidebarTab, icon: FileTree, label: "Explorador" },
    { id: "search" as SidebarTab, icon: Search, label: "Buscar" },
    { id: "git" as SidebarTab, icon: GitBranch, label: "Git" },
    { id: "settings" as SidebarTab, icon: Settings, label: "Configuración" },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card/95 backdrop-blur-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex flex-shrink-0 border-b border-border">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={cn(
              "flex-1 rounded-none border-b-2 border-transparent transition-all",
              activeTab === tab.id && "border-primary bg-secondary/50",
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="h-4 w-4" />
            <span className="sr-only">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {activeTab === "explorer" && <ExplorerContent activeFile={activeFile} onFileSelect={onFileSelect} />}
        {activeTab === "search" && <div className="p-4 text-sm text-muted-foreground">Búsqueda en archivos...</div>}
        {activeTab === "git" && <div className="p-4 text-sm text-muted-foreground">Control de versiones...</div>}
        {activeTab === "settings" && <div className="p-4 text-sm text-muted-foreground">Configuración del IDE...</div>}
      </div>
    </div>
  )
}

function ExplorerContent({
  activeFile,
  onFileSelect,
}: {
  activeFile: string | null
  onFileSelect: (file: string) => void
}) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(true)
  const [workspace, setWorkspace] = useState<string>('')

  // Cargar el árbol de archivos
  const loadFileTree = async () => {
    setLoading(true)
    const response = await api.getFileTree()
    if (response.success && response.data) {
      setFileTree(response.data)
    }
    
    // Obtener workspace actual
    const workspaceRes = await api.getWorkspace()
    if (workspaceRes.success && workspaceRes.data) {
      setWorkspace(workspaceRes.data.path)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadFileTree()
  }, [])

  const toggleFolder = async (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
      
      // Cargar contenido del directorio si no está cargado
      const response = await api.readDirectory(folderPath)
      if (response.success && response.data) {
        // Actualizar el árbol con los nuevos datos
        const updateTree = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.path === folderPath) {
              return { ...node, children: response.data }
            }
            if (node.children) {
              return { ...node, children: updateTree(node.children) }
            }
            return node
          })
        }
        setFileTree(updateTree(fileTree))
      }
    }
    setExpandedFolders(newExpanded)
  }

  const createNewFile = async () => {
    const fileName = prompt('Nombre del archivo:')
    if (fileName) {
      const response = await api.createFile(fileName, '// Nuevo archivo\n')
      if (response.success) {
        loadFileTree()
      }
    }
  }

  const createNewFolder = async () => {
    const folderName = prompt('Nombre de la carpeta:')
    if (folderName) {
      const response = await api.createDirectory(folderName)
      if (response.success) {
        loadFileTree()
      }
    }
  }

  return (
    <div className="space-y-1">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold">EXPLORADOR</h3>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={createNewFile}
            title="Nuevo archivo"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={createNewFolder}
            title="Nueva carpeta"
          >
            <FolderPlus className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={loadFileTree}
            title="Refrescar"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="px-2 py-4 text-center text-xs text-muted-foreground">
          Cargando archivos...
        </div>
      ) : fileTree.length === 0 ? (
        <div className="px-2 py-4 text-center text-xs text-muted-foreground">
          <p className="mb-2">Workspace vacío</p>
          <p className="text-[10px]">{workspace}</p>
        </div>
      ) : (
        fileTree.map((item) => (
          <FileTreeItem
            key={item.path}
            item={item}
            level={0}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
          />
        ))
      )}
    </div>
  )
}

interface FileTreeItemProps {
  item: FileNode
  level: number
  expandedFolders: Set<string>
  toggleFolder: (path: string) => void
  activeFile: string | null
  onFileSelect: (path: string) => void
}

function FileTreeItem({ item, level, expandedFolders, toggleFolder, activeFile, onFileSelect }: FileTreeItemProps) {
  const isExpanded = expandedFolders.has(item.path)
  const isActive = activeFile === item.path

  if (item.type === "directory") {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start rounded-md px-2 py-1 text-sm transition-colors hover:bg-secondary",
            isActive && "border-l-2 border-primary bg-secondary",
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => toggleFolder(item.path)}
        >
          <FolderOpen
            className={cn("mr-2 h-4 w-4 text-blue-500 transition-transform", !isExpanded && "rotate-[-90deg]")}
          />
          {item.name}
        </Button>
        {isExpanded && item.children && (
          <div>
            {item.children.map((child: FileNode) => (
              <FileTreeItem
                key={child.path}
                item={child}
                level={level + 1}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start rounded-md px-2 py-1 text-sm transition-colors hover:bg-secondary",
        isActive && "border-l-2 border-primary bg-secondary",
      )}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
      onClick={() => onFileSelect(item.path)}
    >
      <FileIcon filename={item.name} />
      {item.name}
    </Button>
  )
}

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split(".").pop()
  const colors: Record<string, string> = {
    js: "text-yellow-500",
    jsx: "text-blue-400",
    ts: "text-blue-500",
    tsx: "text-blue-500",
    css: "text-pink-500",
    json: "text-green-500",
    md: "text-gray-400",
  }

  return (
    <div className={cn("mr-2 h-4 w-4 rounded-sm", colors[ext || ""] || "text-gray-500")}>
      <FileTree className="h-4 w-4" />
    </div>
  )
}
