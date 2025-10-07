"use client"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ui/context-menu"
import { FileText, Folder, Trash2, Edit3, Copy, Scissors, ClipboardPaste } from "lucide-react"

interface FileContextMenuProps {
  children: React.ReactNode
  isFolder: boolean
  onRename: () => void
  onDelete: () => void
  onCopy?: () => void
  onCut?: () => void
  onPaste?: () => void
  onNewFile?: () => void
  onNewFolder?: () => void
}

export function FileContextMenu({
  children,
  isFolder,
  onRename,
  onDelete,
  onCopy,
  onCut,
  onPaste,
  onNewFile,
  onNewFolder,
}: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {isFolder && onNewFile && (
          <>
            <ContextMenuItem onClick={onNewFile}>
              <FileText className="mr-2 h-4 w-4" />
              Nuevo Archivo
            </ContextMenuItem>
            <ContextMenuItem onClick={onNewFolder}>
              <Folder className="mr-2 h-4 w-4" />
              Nueva Carpeta
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        <ContextMenuItem onClick={onRename}>
          <Edit3 className="mr-2 h-4 w-4" />
          Renombrar
        </ContextMenuItem>

        {onCopy && (
          <ContextMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </ContextMenuItem>
        )}

        {onCut && (
          <ContextMenuItem onClick={onCut}>
            <Scissors className="mr-2 h-4 w-4" />
            Cortar
          </ContextMenuItem>
        )}

        {onPaste && (
          <ContextMenuItem onClick={onPaste}>
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Pegar
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

