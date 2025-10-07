"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { X, ChevronDown, ChevronUp, Replace, ReplaceAll, Search, CaseSensitive, Regex as RegexIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FindReplaceProps {
  onFind?: (query: string, options: FindOptions) => void
  onReplace?: (query: string, replacement: string) => void
  onReplaceAll?: (query: string, replacement: string) => void
  onClose?: () => void
  mode?: "find" | "replace"
}

export interface FindOptions {
  caseSensitive: boolean
  regex: boolean
  wholeWord: boolean
}

export function FindReplace({ 
  onFind, 
  onReplace, 
  onReplaceAll, 
  onClose,
  mode = "find" 
}: FindReplaceProps) {
  const [findQuery, setFindQuery] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [options, setOptions] = useState<FindOptions>({
    caseSensitive: false,
    regex: false,
    wholeWord: false,
  })
  const [currentMode, setCurrentMode] = useState<"find" | "replace">(mode)
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)

  useEffect(() => {
    setCurrentMode(mode)
  }, [mode])

  const handleFind = () => {
    if (findQuery) {
      onFind?.(findQuery, options)
    }
  }

  const handleReplace = () => {
    if (findQuery && replaceText) {
      onReplace?.(findQuery, replaceText)
      setCurrentMatch(prev => Math.max(1, prev - 1))
      setMatchCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleReplaceAll = () => {
    if (findQuery && replaceText) {
      onReplaceAll?.(findQuery, replaceText)
      setMatchCount(0)
      setCurrentMatch(0)
    }
  }

  const handleNext = () => {
    if (matchCount > 0) {
      setCurrentMatch(prev => (prev % matchCount) + 1)
    }
  }

  const handlePrevious = () => {
    if (matchCount > 0) {
      setCurrentMatch(prev => prev === 1 ? matchCount : prev - 1)
    }
  }

  const toggleOption = (option: keyof FindOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  return (
    <div className="bg-card border-b border-border p-3 space-y-2">
      {/* Find Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) {
                  handlePrevious()
                } else {
                  handleNext()
                }
              } else if (e.key === "Escape") {
                onClose?.()
              }
            }}
            className="pl-9 pr-24"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {matchCount > 0 && (
              <span className="text-xs text-muted-foreground px-2">
                {currentMatch}/{matchCount}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={matchCount === 0}
          title="Anterior (Shift+Enter)"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={matchCount === 0}
          title="Siguiente (Enter)"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMode(currentMode === "find" ? "replace" : "find")}
          title="Mostrar/Ocultar Reemplazar"
        >
          <Replace className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          title="Cerrar (Esc)"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Replace Row */}
      {currentMode === "replace" && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              placeholder="Reemplazar"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleReplace()
                } else if (e.key === "Escape") {
                  onClose?.()
                }
              }}
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReplace}
            disabled={!findQuery || matchCount === 0}
            title="Reemplazar (Enter)"
          >
            Reemplazar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleReplaceAll}
            disabled={!findQuery || matchCount === 0}
            title="Reemplazar Todo"
            className="gap-1"
          >
            <ReplaceAll className="h-4 w-4" />
            Todo
          </Button>
        </div>
      )}

      {/* Options Row */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant={options.caseSensitive ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleOption("caseSensitive")}
          title="Coincidir Mayúsculas/Minúsculas"
          className="h-7 px-2"
        >
          <CaseSensitive className="h-4 w-4" />
        </Button>

        <Button
          variant={options.wholeWord ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleOption("wholeWord")}
          title="Coincidir Palabra Completa"
          className="h-7 px-2 text-xs font-mono"
        >
          ab|
        </Button>

        <Button
          variant={options.regex ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleOption("regex")}
          title="Usar Expresiones Regulares"
          className="h-7 px-2"
        >
          <RegexIcon className="h-4 w-4" />
        </Button>

        {matchCount > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {matchCount} {matchCount === 1 ? "coincidencia" : "coincidencias"}
          </span>
        )}
      </div>
    </div>
  )
}
