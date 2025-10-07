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
import { FolderOpen, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { api } from "@/lib/api"

interface OpenFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFolderOpened: (path: string) => void
}

export function OpenFolderDialog({ open, onOpenChange, onFolderOpened }: OpenFolderDialogProps) {
  const [path, setPath] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validating, setValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const validatePath = async (pathToValidate: string) => {
    if (!pathToValidate.trim()) {
      setIsValid(null)
      return
    }

    setValidating(true)
    try {
      const response = await api.validatePath(pathToValidate)
      if (response.success && response.data) {
        setIsValid(response.data.valid)
        if (!response.data.valid) {
          setError(response.data.reason || "Ruta inválida")
        } else {
          setError("")
        }
      }
    } catch (err) {
      setIsValid(false)
      setError("Error al validar la ruta")
    } finally {
      setValidating(false)
    }
  }

  const handlePathChange = (newPath: string) => {
    setPath(newPath)
    setError("")
    setIsValid(null)
  }

  const handleValidate = () => {
    validatePath(path)
  }

  const handleConfirm = async () => {
    if (!path.trim()) {
      setError("La ruta no puede estar vacía")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.setWorkspace(path)
      if (response.success) {
        onFolderOpened(path)
        setPath("")
        setIsValid(null)
        onOpenChange(false)
      } else {
        setError(response.error || "Error al abrir la carpeta")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al abrir la carpeta")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPath("")
    setError("")
    setIsValid(null)
    onOpenChange(false)
  }

  const handleQuickPath = (quickPath: string) => {
    setPath(quickPath)
    setIsValid(null)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-500" />
            Abrir Carpeta
          </DialogTitle>
          <DialogDescription>
            Selecciona una carpeta de tu sistema para trabajar con sus archivos
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="path">Ruta de la carpeta</Label>
            <div className="flex gap-2">
              <Input
                id="path"
                placeholder="C:\Users\TuUsuario\Documentos\MiProyecto"
                value={path}
                onChange={(e) => handlePathChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && isValid) {
                    handleConfirm()
                  }
                }}
                disabled={loading}
                className={
                  isValid === true
                    ? "border-green-500"
                    : isValid === false
                    ? "border-destructive"
                    : ""
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                disabled={!path.trim() || validating || loading}
              >
                {validating ? "..." : "Validar"}
              </Button>
            </div>
            
            {isValid === true && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                Ruta válida
              </div>
            )}
            
            {isValid === false && error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong>💡 Ejemplos de rutas:</strong></p>
                <div className="space-y-1 ml-2">
                  <p>• Windows: <code className="rounded bg-background px-1">C:\Users\Usuario\Desktop\MiProyecto</code></p>
                  <p>• Linux/Mac: <code className="rounded bg-background px-1">/home/usuario/proyectos/mi-app</code></p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Accesos rápidos:</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPath("C:\\Users")}
                className="text-xs"
              >
                📁 Users (Windows)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPath("C:\\Users\\"+process.env.USERNAME || "Usuario")}
                className="text-xs"
              >
                👤 Mi Usuario
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPath("/home")}
                className="text-xs"
              >
                🐧 Home (Linux)
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || !path.trim() || isValid === false}
          >
            {loading ? "Abriendo..." : "Abrir Carpeta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

