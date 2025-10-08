"use client"

import { useState, useEffect } from "react"
import {
  Code2,
  Copy,
  Search,
  Star,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Check
} from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"

interface Snippet {
  id: string
  title: string
  description: string
  language: string
  code: string
  category: string
  tags: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
}

interface SnippetCategory {
  id: string
  name: string
  description: string
  icon: string
  snippets: Snippet[]
}

interface SnippetsPanelProps {
  activeFile?: string | null
  onInsertCode?: (code: string) => void
}

export function SnippetsPanel({ activeFile, onInsertCode }: SnippetsPanelProps) {
  const [categories, setCategories] = useState<SnippetCategory[]>([])
  const [recommended, setRecommended] = useState<Snippet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (activeFile) {
      loadRecommendations(activeFile)
    }
  }, [activeFile])

  const loadCategories = async () => {
    try {
      const response = await api.getSnippetCategories()
      if (response.success && response.data) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error("Error loading snippets:", error)
    }
  }

  const loadRecommendations = async (file: string) => {
    try {
      const response = await api.getRecommendedSnippets(file)
      if (response.success && response.data) {
        setRecommended(response.data.snippets)
        if (response.data.snippets.length > 0) {
          setActiveTab('recommended')
        }
      }
    } catch (error) {
      console.error("Error loading recommendations:", error)
    }
  }

  const searchSnippets = async (query: string) => {
    if (!query.trim()) {
      loadCategories()
      return
    }

    try {
      const response = await api.searchSnippets(query)
      if (response.success && response.data) {
        // Convertir resultados de búsqueda en una categoría temporal
        setCategories([{
          id: 'search-results',
          name: 'Resultados de Búsqueda',
          description: `${response.data.snippets.length} snippets encontrados`,
          icon: '🔍',
          snippets: response.data.snippets
        }])
        setExpandedCategories(new Set(['search-results']))
      }
    } catch (error) {
      console.error("Error searching snippets:", error)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchSnippets(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleCopySnippet = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopiedId(snippet.id)
      toast({
        title: "Copiado",
        description: `Snippet "${snippet.title}" copiado al portapapeles`,
      })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el snippet",
        variant: "destructive"
      })
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const getLevelBadge = (level: Snippet['level']) => {
    const styles = {
      beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
      intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      advanced: 'bg-red-500/10 text-red-500 border-red-500/20'
    }

    const labels = {
      beginner: 'Básico',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    }

    return (
      <Badge variant="outline" className={`text-xs ${styles[level]}`}>
        {labels[level]}
      </Badge>
    )
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-semibold">Snippets</span>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar snippets..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-3 py-2 transition-colors ${
            activeTab === 'recommended'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Para Ti
          </div>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-1">
            <Code2 className="h-3 w-3" />
            Todos
          </div>
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Recommended Snippets */}
          {activeTab === 'recommended' && (
            <>
              {activeFile && recommended.length > 0 && (
                <div className="mb-3 p-2 bg-purple-500/5 border border-purple-500/20 rounded-md">
                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Snippets para: <code className="bg-purple-500/10 px-1 rounded">{activeFile.split('/').pop()}</code></span>
                  </div>
                </div>
              )}

              {recommended.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Code2 className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-sm font-semibold">
                    {activeFile ? 'Sin snippets recomendados' : 'Abre un archivo'}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    {activeFile
                      ? 'No hay snippets específicos para este tipo de archivo'
                      : 'Abre un archivo para ver snippets recomendados'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recommended.map((snippet) => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onCopy={handleCopySnippet}
                      copied={copiedId === snippet.id}
                      getLevelBadge={getLevelBadge}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* All Snippets by Category */}
          {activeTab === 'all' && (
            <div className="space-y-2">
              {categories.map((category) => {
                const isExpanded = expandedCategories.has(category.id)

                return (
                  <Collapsible
                    key={category.id}
                    open={isExpanded}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="text-base">{category.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {category.description}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.snippets.length}
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-2 mt-1 space-y-2">
                        {category.snippets.map((snippet) => (
                          <SnippetCard
                            key={snippet.id}
                            snippet={snippet}
                            onCopy={handleCopySnippet}
                            copied={copiedId === snippet.id}
                            getLevelBadge={getLevelBadge}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}

              {categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Sin resultados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface SnippetCardProps {
  snippet: Snippet
  onCopy: (snippet: Snippet) => void
  copied: boolean
  getLevelBadge: (level: Snippet['level']) => JSX.Element
}

function SnippetCard({ snippet, onCopy, copied, getLevelBadge }: SnippetCardProps) {
  return (
    <div className="rounded-md border border-border p-3 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium mb-1">{snippet.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {snippet.description}
          </p>
        </div>
        {getLevelBadge(snippet.level)}
      </div>

      {/* Code Preview */}
      <div className="relative group">
        <pre className="text-xs bg-muted/50 p-2 rounded-md overflow-x-auto mb-2 max-h-32">
          <code className="language-{snippet.language}">{snippet.code}</code>
        </pre>
        
        {/* Copy Button Overlay */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onCopy(snippet)}
          className="absolute top-2 right-2 h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </>
          )}
        </Button>
      </div>

      {/* Tags */}
      {snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {snippet.tags.slice(0, 4).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] h-4 px-1"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

