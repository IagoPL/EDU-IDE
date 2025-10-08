"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, FileText, ChevronRight, ChevronDown, Filter, Loader2 } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"
import { api } from "@/lib/api"

interface SearchResult {
  file: string
  line: number
  column: number
  text: string
  matchStart: number
  matchEnd: number
}

interface GroupedResults {
  [file: string]: SearchResult[]
}

interface FindInFilesProps {
  onFileSelect?: (file: string, line?: number) => void
}

export function FindInFiles({ onFileSelect }: FindInFilesProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GroupedResults>({})
  const [searching, setSearching] = useState(false)
  const [totalMatches, setTotalMatches] = useState(0)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [includePattern, setIncludePattern] = useState("*")
  const [excludePattern, setExcludePattern] = useState("node_modules,dist,.git")
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults({})
      setTotalMatches(0)
      return
    }

    setSearching(true)

    try {
      const response = await api.searchInFiles({
        query,
        caseSensitive,
        useRegex,
        wholeWord,
        includePattern,
        excludePattern
      })

      if (response.success && response.data) {
        const grouped: GroupedResults = {}
        let total = 0

        response.data.forEach((result: SearchResult) => {
          if (!grouped[result.file]) {
            grouped[result.file] = []
          }
          grouped[result.file].push(result)
          total++
        })

        setResults(grouped)
        setTotalMatches(total)
        
        // Auto-expandir si hay pocos archivos
        if (Object.keys(grouped).length <= 5) {
          setExpandedFiles(new Set(Object.keys(grouped)))
        }
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setSearching(false)
    }
  }, [query, caseSensitive, useRegex, wholeWord, includePattern, excludePattern])

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [performSearch])

  const toggleFileExpanded = (file: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(file)) {
      newExpanded.delete(file)
    } else {
      newExpanded.add(file)
    }
    setExpandedFiles(newExpanded)
  }

  const expandAll = () => {
    setExpandedFiles(new Set(Object.keys(results)))
  }

  const collapseAll = () => {
    setExpandedFiles(new Set())
  }

  const handleResultClick = (file: string, line: number) => {
    onFileSelect?.(file, line)
  }

  const highlightMatch = (text: string, start: number, end: number) => {
    const before = text.substring(0, start)
    const match = text.substring(start, end)
    const after = text.substring(end)

    return (
      <>
        {before}
        <span className="bg-yellow-400/30 dark:bg-yellow-500/30 text-foreground font-semibold">
          {match}
        </span>
        {after}
      </>
    )
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const colors: Record<string, string> = {
      'js': 'text-yellow-500',
      'ts': 'text-blue-500',
      'jsx': 'text-cyan-500',
      'tsx': 'text-cyan-600',
      'py': 'text-green-600',
      'html': 'text-orange-500',
      'css': 'text-pink-500',
      'json': 'text-gray-500',
      'md': 'text-blue-400',
    }
    return colors[ext || ''] || 'text-gray-400'
  }

  const fileCount = Object.keys(results).length

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Search Input */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en archivos..."
              className="pl-9 pr-9"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-accent" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Options */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Checkbox
              id="case-sensitive"
              checked={caseSensitive}
              onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
            />
            <Label htmlFor="case-sensitive" className="cursor-pointer">Aa</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="whole-word"
              checked={wholeWord}
              onCheckedChange={(checked) => setWholeWord(checked as boolean)}
            />
            <Label htmlFor="whole-word" className="cursor-pointer">Ab|</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="regex"
              checked={useRegex}
              onCheckedChange={(checked) => setUseRegex(checked as boolean)}
            />
            <Label htmlFor="regex" className="cursor-pointer">.*</Label>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div>
              <Label htmlFor="include" className="text-xs text-muted-foreground">
                Incluir archivos
              </Label>
              <Input
                id="include"
                value={includePattern}
                onChange={(e) => setIncludePattern(e.target.value)}
                placeholder="*.js, *.ts"
                className="h-8 text-sm mt-1"
              />
            </div>
            <div>
              <Label htmlFor="exclude" className="text-xs text-muted-foreground">
                Excluir carpetas
              </Label>
              <Input
                id="exclude"
                value={excludePattern}
                onChange={(e) => setExcludePattern(e.target.value)}
                placeholder="node_modules, dist"
                className="h-8 text-sm mt-1"
              />
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {searching ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : totalMatches > 0 ? (
              <>
                <span className="font-medium text-foreground">{totalMatches}</span>
                <span>resultado{totalMatches !== 1 ? 's' : ''} en</span>
                <span className="font-medium text-foreground">{fileCount}</span>
                <span>archivo{fileCount !== 1 ? 's' : ''}</span>
              </>
            ) : query ? (
              <span>Sin resultados</span>
            ) : (
              <span>Escribe para buscar</span>
            )}
          </div>
          {fileCount > 0 && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="h-6 px-2 text-xs"
              >
                Expandir todo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="h-6 px-2 text-xs"
              >
                Colapsar todo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(results).map(([file, fileResults]) => {
            const isExpanded = expandedFiles.has(file)
            const matchCount = fileResults.length

            return (
              <Collapsible
                key={file}
                open={isExpanded}
                onOpenChange={() => toggleFileExpanded(file)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent group">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <FileText className={`h-4 w-4 flex-shrink-0 ${getFileIcon(file)}`} />
                    <span className="text-sm font-medium truncate flex-1 text-left">
                      {file}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {matchCount}
                    </Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-6 mt-1 space-y-1">
                    {fileResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleResultClick(result.file, result.line)}
                        className="flex items-start gap-2 p-2 rounded-md hover:bg-accent cursor-pointer group"
                      >
                        <span className="text-xs text-muted-foreground font-mono min-w-[3rem] text-right">
                          {result.line}:{result.column}
                        </span>
                        <code className="text-xs flex-1 font-mono">
                          {highlightMatch(result.text, result.matchStart, result.matchEnd)}
                        </code>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

