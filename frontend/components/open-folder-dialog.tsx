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
import { ScrollArea } from "./ui/scroll-area"
import { FolderOpen, AlertCircle, CheckCircle2, Info, Search, Clock, X, Folder } from "lucide-react"
import { api } from "@/lib/api"
import { useRecentFolders, type RecentFolder } from "@/hooks/use-recent-folders"

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
  const [pickingFolder, setPickingFolder] = useState(false)
  const { recentFolders, addRecentFolder, removeRecentFolder, clearRecentFolders } = useRecentFolders()

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

  const handleConfirm = async (pathToOpen?: string) => {
    const finalPath = pathToOpen || path
    
    if (!finalPath.trim()) {
      setError("La ruta no puede estar vacía")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await api.setWorkspace(finalPath)
      if (response.success) {
        addRecentFolder(finalPath)
        onFolderOpened(finalPath)
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

  const handleBrowse = async () => {
    setPickingFolder(true)
    setError("")

    try {
      const response = await api.openFilePicker(path || undefined)
      if (response.success && response.data) {
        if (!response.data.cancelled && response.data.path) {
          setPath(response.data.path)
          setIsValid(true)
          setError("")
        }
      } else {
        setError(response.error || "Error al abrir el explorador")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al abrir el explorador")
    } finally {
      setPickingFolder(false)
    }
  }

  const handleRecentClick = (folder: RecentFolder) => {
    handleConfirm(folder.path)
  }

  const handleRemoveRecent = (e: React.MouseEvent, folderPath: string) => {
    e.stopPropagation()
    removeRecentFolder(folderPath)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString()
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
      <DialogContent className="sm:max-w-[650px] max-h-[80vh]">
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
          {/* Recent Folders */}
          {recentFolders.length > 0 && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Carpetas recientes
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentFolders}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </Button>
              </div>
              <ScrollArea className="h-32 rounded-md border border-border">
                <div className="p-2 space-y-1">
                  {recentFolders.map((folder) => (
                    <div
                      key={folder.path}
                      onClick={() => handleRecentClick(folder)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Folder className="h-4 w-4 flex-shrink-0 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{folder.name}</p>
                          <p className="text-xs text-muted-foreground truncate" title={folder.path}>
                            {folder.path}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(folder.lastOpened)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleRemoveRecent(e, folder.path)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* File Picker */}
          <div className="grid gap-2">
            <Label>Explorador de archivos</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleBrowse}
              disabled={pickingFolder || loading}
              className="w-full justify-start gap-2"
            >
              <Search className="h-4 w-4" />
              {pickingFolder ? "Abriendo explorador..." : "Buscar carpeta en mi PC"}
            </Button>
          </div>

          {/* Manual Path Input */}
          <div className="grid gap-2">
            <Label htmlFor="path">O escribe la ruta manualmente</Label>
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
                disabled={loading || pickingFolder}
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
                disabled={!path.trim() || validating || loading || pickingFolder}
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
          <Button variant="outline" onClick={handleClose} disabled={loading || pickingFolder}>
            Cancelar
          </Button>
          <Button 
            onClick={() => handleConfirm()} 
            disabled={loading || pickingFolder || !path.trim() || isValid === false}
          >
            {loading ? "Abriendo..." : "Abrir Carpeta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


