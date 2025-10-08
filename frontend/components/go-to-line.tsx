"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Hash } from "lucide-react"

interface GoToLineProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoToLine: (line: number) => void
  totalLines?: number
}

export function GoToLine({ open, onOpenChange, onGoToLine, totalLines }: GoToLineProps) {
  const [lineNumber, setLineNumber] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setLineNumber("")
      setError("")
      // Focus el input cuando se abre
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [open])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()

    const line = parseInt(lineNumber, 10)

    if (!lineNumber.trim()) {
      setError("Ingresa un número de línea")
      return
    }

    if (isNaN(line) || line < 1) {
      setError("Número de línea inválido")
      return
    }

    if (totalLines && line > totalLines) {
      setError(`La línea debe estar entre 1 y ${totalLines}`)
      return
    }

    // Todo OK, ir a la línea
    onGoToLine(line)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-500" />
            Ir a Línea
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="line-number">
              Número de línea{totalLines && ` (1-${totalLines})`}
            </Label>
            <Input
              ref={inputRef}
              id="line-number"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={totalLines ? `1-${totalLines}` : "1"}
              value={lineNumber}
              onChange={(e) => {
                setLineNumber(e.target.value)
                setError("")
              }}
              onKeyDown={handleKeyDown}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Presiona Enter para ir</span>
            <span>Esc para cerrar</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar Go to Line con Ctrl+G
export function useGoToLine(onGoToLine: (line: number) => void, totalLines?: number) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    open,
    setOpen,
    GoToLineDialog: () => (
      <GoToLine
        open={open}
        onOpenChange={setOpen}
        onGoToLine={onGoToLine}
        totalLines={totalLines}
      />
    )
  }
}

