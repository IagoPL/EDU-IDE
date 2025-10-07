"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { EditorArea } from "./editor-area"
import { RightPanel } from "./right-panel"
import { Toolbar } from "./toolbar"
import { StatusBar } from "./status-bar"

export function IDELayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [activeFile, setActiveFile] = useState<string | null>(null)

  return (
    <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        sidebarOpen={sidebarOpen}
        rightPanelOpen={rightPanelOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-64 flex-shrink-0 border-r border-border">
            <Sidebar activeFile={activeFile} onFileSelect={setActiveFile} />
          </div>
        )}

        {/* Editor Area - takes remaining space */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <EditorArea activeFile={activeFile} />
        </div>

        {/* Right Panel */}
        {rightPanelOpen && (
          <div className="w-80 flex-shrink-0 border-l border-border">
            <RightPanel />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar activeFile={activeFile} />
    </div>
  )
}
