"use client"

import { ChevronRight, Home } from "lucide-react"
import { Button } from "./ui/button"

interface BreadcrumbsProps {
  filePath: string | null
  onNavigate?: (path: string) => void
}

export function Breadcrumbs({ filePath, onNavigate }: BreadcrumbsProps) {
  if (!filePath) {
    return (
      <div className="flex h-8 items-center gap-1 border-b border-border bg-card/50 px-3 text-xs">
        <Home className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">Sin archivo abierto</span>
      </div>
    )
  }

  // Dividir el path en segmentos
  const segments = filePath.split('/').filter(Boolean)
  
  // Construir paths acumulativos para navegación
  const paths: string[] = []
  segments.forEach((segment, index) => {
    if (index === 0) {
      paths.push(segment)
    } else {
      paths.push(paths[index - 1] + '/' + segment)
    }
  })

  return (
    <div className="flex h-8 items-center gap-1 border-b border-border bg-card/50 px-3 text-xs overflow-x-auto">
      {/* Icono de Home */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-accent"
        onClick={() => onNavigate?.('')}
        title="Ir a raíz"
      >
        <Home className="h-3 w-3" />
      </Button>

      {/* Segmentos del path */}
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const currentPath = paths[index]

        return (
          <div key={currentPath} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            
            {isLast ? (
              // Último segmento (archivo actual) - sin click
              <span className="font-medium text-foreground truncate max-w-[200px]" title={segment}>
                {segment}
              </span>
            ) : (
              // Carpetas - clickeables
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 hover:bg-accent text-muted-foreground hover:text-foreground font-normal"
                onClick={() => onNavigate?.(currentPath)}
                title={currentPath}
              >
                <span className="truncate max-w-[150px]">{segment}</span>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}

