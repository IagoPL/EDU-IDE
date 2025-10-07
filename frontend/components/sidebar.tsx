"use client"

import { useState, useEffect } from "react"
import { FileType as FileTree, FolderOpen, Search, GitBranch, Settings, RefreshCw, Plus, FolderPlus, File, Folder, Edit3, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { api, FileNode } from "@/lib/api"
import { GitPanel } from "./git-panel"
import { FileDialog } from "./file-dialog"
import { DeleteDialog } from "./delete-dialog"
import { FileContextMenu } from "./file-context-menu"
import { Input } from "./ui/input"
import { useToast } from "@/hooks/use-toast"

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
        {activeTab === "git" && <GitPanel />}
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
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const [fileDialogType, setFileDialogType] = useState<"file" | "folder">("file")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ name: string; path: string; type: "file" | "folder" } | null>(null)
  const [renamingItem, setRenamingItem] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const { toast } = useToast()

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

  const createNewFile = () => {
    setFileDialogType("file")
    setFileDialogOpen(true)
  }

  const createNewFolder = () => {
    setFileDialogType("folder")
    setFileDialogOpen(true)
  }

  const handleFileDialogConfirm = async (name: string) => {
    try {
      if (fileDialogType === "file") {
        const response = await api.createFile(name, '')
        if (response.success) {
          await loadFileTree()
          toast({
            title: "Archivo creado",
            description: `${name} se ha creado correctamente`,
          })
        }
      } else {
        const response = await api.createDirectory(name)
        if (response.success) {
          await loadFileTree()
          toast({
            title: "Carpeta creada",
            description: `${name} se ha creado correctamente`,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el elemento",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeleteItem = (item: FileNode) => {
    setItemToDelete({
      name: item.name,
      path: item.path,
      type: item.type === "directory" ? "folder" : "file",
    })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      if (itemToDelete.type === "folder") {
        const response = await api.deleteDirectory(itemToDelete.path)
        if (response.success) {
          await loadFileTree()
          toast({
            title: "Carpeta eliminada",
            description: `${itemToDelete.name} se ha eliminado correctamente`,
          })
        }
      } else {
        const response = await api.deleteFile(itemToDelete.path)
        if (response.success) {
          await loadFileTree()
          toast({
            title: "Archivo eliminado",
            description: `${itemToDelete.name} se ha eliminado correctamente`,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el elemento",
        variant: "destructive",
      })
    }
  }

  const handleRenameItem = (item: FileNode) => {
    setRenamingItem(item.path)
    setRenameValue(item.name)
  }

  const confirmRename = async (oldPath: string) => {
    if (!renameValue.trim() || renameValue === oldPath.split('/').pop()) {
      setRenamingItem(null)
      return
    }

    try {
      const newPath = oldPath.replace(/[^/]+$/, renameValue)
      const response = await api.renameFile(oldPath, newPath)
      if (response.success) {
        await loadFileTree()
        setRenamingItem(null)
        toast({
          title: "Renombrado",
          description: `Renombrado correctamente a ${renameValue}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo renombrar el elemento",
        variant: "destructive",
      })
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
            onDelete={handleDeleteItem}
            onRename={handleRenameItem}
            renamingItem={renamingItem}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            confirmRename={confirmRename}
          />
        ))
      )}

      <FileDialog
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        type={fileDialogType}
        onConfirm={handleFileDialogConfirm}
      />

      {itemToDelete && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={itemToDelete.name}
          itemType={itemToDelete.type}
          onConfirm={confirmDelete}
        />
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
  onDelete: (item: FileNode) => void
  onRename: (item: FileNode) => void
  renamingItem: string | null
  renameValue: string
  setRenameValue: (value: string) => void
  confirmRename: (path: string) => void
}

function FileTreeItem({ 
  item, 
  level, 
  expandedFolders, 
  toggleFolder, 
  activeFile, 
  onFileSelect,
  onDelete,
  onRename,
  renamingItem,
  renameValue,
  setRenameValue,
  confirmRename
}: FileTreeItemProps) {
  const isExpanded = expandedFolders.has(item.path)
  const isActive = activeFile === item.path
  const isRenaming = renamingItem === item.path

  if (item.type === "directory") {
    return (
      <div>
        <FileContextMenu
          isFolder={true}
          onRename={() => onRename(item)}
          onDelete={() => onDelete(item)}
          onNewFile={() => {}}
          onNewFolder={() => {}}
        >
          {isRenaming ? (
            <div style={{ paddingLeft: `${level * 12 + 8}px` }} className="px-2 py-1">
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmRename(item.path)
                  if (e.key === "Escape") setRenameValue("")
                }}
                onBlur={() => confirmRename(item.path)}
                className="h-7 text-sm"
                autoFocus
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent",
                isActive && "border-l-2 border-primary bg-accent",
              )}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => toggleFolder(item.path)}
            >
              <Folder
                className={cn("mr-2 h-4 w-4 text-yellow-500 transition-transform", !isExpanded && "rotate-[-90deg]")}
              />
              <span className="truncate">{item.name}</span>
              <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRename(item)
                  }}
                  className="rounded p-0.5 hover:bg-background"
                  title="Renombrar"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item)
                  }}
                  className="rounded p-0.5 hover:bg-background"
                  title="Eliminar"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </div>
            </Button>
          )}
        </FileContextMenu>
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
                onDelete={onDelete}
                onRename={onRename}
                renamingItem={renamingItem}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                confirmRename={confirmRename}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <FileContextMenu
      isFolder={false}
      onRename={() => onRename(item)}
      onDelete={() => onDelete(item)}
    >
      {isRenaming ? (
        <div style={{ paddingLeft: `${level * 12 + 24}px` }} className="px-2 py-1">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename(item.path)
              if (e.key === "Escape") setRenameValue("")
            }}
            onBlur={() => confirmRename(item.path)}
            className="h-7 text-sm"
            autoFocus
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "group w-full justify-start rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent",
            isActive && "border-l-2 border-primary bg-accent",
          )}
          style={{ paddingLeft: `${level * 12 + 24}px` }}
          onClick={() => onFileSelect(item.path)}
        >
          <FileIcon filename={item.name} />
          <span className="truncate">{item.name}</span>
          <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRename(item)
              }}
              className="rounded p-0.5 hover:bg-background"
              title="Renombrar"
            >
              <Edit3 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item)
              }}
              className="rounded p-0.5 hover:bg-background"
              title="Eliminar"
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </button>
          </div>
        </Button>
      )}
    </FileContextMenu>
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
