"use client"

import { useState } from "react"
import { FileType as FileTree, FolderOpen, Search, GitBranch, Settings } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]))

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder)
    } else {
      newExpanded.add(folder)
    }
    setExpandedFolders(newExpanded)
  }

  // Sample file structure
  const fileStructure = [
    {
      type: "folder",
      name: "src",
      path: "src",
      children: [
        { type: "file", name: "index.js", path: "src/index.js" },
        { type: "file", name: "App.js", path: "src/App.js" },
        { type: "file", name: "styles.css", path: "src/styles.css" },
      ],
    },
    { type: "file", name: "package.json", path: "package.json" },
    { type: "file", name: "README.md", path: "README.md" },
  ]

  return (
    <div className="space-y-1">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold">PROYECTO</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <FolderOpen className="h-3 w-3" />
        </Button>
      </div>

      {fileStructure.map((item) => (
        <FileTreeItem
          key={item.path}
          item={item}
          level={0}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          activeFile={activeFile}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  )
}

function FileTreeItem({ item, level, expandedFolders, toggleFolder, activeFile, onFileSelect }: any) {
  const isExpanded = expandedFolders.has(item.path)
  const isActive = activeFile === item.path

  if (item.type === "folder") {
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
            {item.children.map((child: any) => (
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
