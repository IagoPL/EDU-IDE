"use client"

import { Circle, GitBranch, AlertCircle, CheckCircle } from "lucide-react"

interface StatusBarProps {
  activeFile: string | null
}

export function StatusBar({ activeFile }: StatusBarProps) {
  return (
    <div className="flex h-6 items-center justify-between border-t border-border bg-card px-4 text-xs">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Sin errores</span>
        </div>

        <div className="flex items-center gap-2">
          <AlertCircle className="h-3 w-3 text-yellow-500" />
          <span>0 advertencias</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {activeFile && (
          <>
            <span>{activeFile.split(".").pop()?.toUpperCase()}</span>
            <span>UTF-8</span>
            <span>Ln 1, Col 1</span>
          </>
        )}
        <div className="flex items-center gap-1">
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          <span>Conectado</span>
        </div>
      </div>
    </div>
  )
}
