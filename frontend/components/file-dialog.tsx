"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { FileText, Folder, AlertCircle } from "lucide-react"

interface FileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "file" | "folder"
  onConfirm: (name: string) => Promise<void>
  parentPath?: string
}

export function FileDialog({ open, onOpenChange, type, onConfirm, parentPath }: FileDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError("El nombre no puede estar vacío")
      return
    }

    // Validar caracteres no permitidos
    const invalidChars = /[<>:"|?*]/
    if (invalidChars.test(name)) {
      setError("El nombre contiene caracteres no permitidos")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onConfirm(name)
      setName("")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "file" ? (
              <>
                <FileText className="h-5 w-5 text-blue-500" />
                Nuevo Archivo
              </>
            ) : (
              <>
                <Folder className="h-5 w-5 text-yellow-500" />
                Nueva Carpeta
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {type === "file"
              ? "Crea un nuevo archivo en tu workspace"
              : "Crea una nueva carpeta para organizar tus archivos"}
            {parentPath && (
              <span className="mt-1 block text-xs text-muted-foreground">
                En: {parentPath}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Nombre {type === "file" ? "del archivo" : "de la carpeta"}
            </Label>
            <Input
              id="name"
              placeholder={
                type === "file"
                  ? "ejemplo.js, app.tsx, styles.css..."
                  : "components, utils, assets..."
              }
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleConfirm()
                }
              }}
              autoFocus
              disabled={loading}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {type === "file" && (
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Puedes crear archivos en subcarpetas usando{" "}
                <code className="rounded bg-background px-1">carpeta/archivo.js</code>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !name.trim()}>
            {loading ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

