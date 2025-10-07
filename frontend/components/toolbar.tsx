"use client"

import { Button } from "./ui/button"
import { PanelLeftClose, PanelRightClose, Play, Square, RotateCcw, Settings, User } from "lucide-react"
import { ThemeSwitcher } from "./theme-switcher"

interface ToolbarProps {
  sidebarOpen: boolean
  rightPanelOpen: boolean
  onToggleSidebar: () => void
  onToggleRightPanel: () => void
}

export function Toolbar({ sidebarOpen, rightPanelOpen, onToggleSidebar, onToggleRightPanel }: ToolbarProps) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="gap-2">
          <PanelLeftClose className={`h-4 w-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button variant="ghost" size="sm" className="gap-2">
          <Play className="h-4 w-4" />
          Ejecutar
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Square className="h-4 w-4" />
          Detener
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </Button>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-2">
        <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
          EduIDE
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button variant="ghost" size="sm" onClick={onToggleRightPanel}>
          <PanelRightClose className={`h-4 w-4 transition-transform ${!rightPanelOpen ? "rotate-180" : ""}`} />
        </Button>
      </div>
    </div>
  )
}
