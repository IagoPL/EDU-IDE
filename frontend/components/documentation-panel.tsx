"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  ExternalLink,
  Star,
  Search,
  Filter,
  Lightbulb,
  FileText,
  Sparkles
} from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { api } from "@/lib/api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible"

interface DocResource {
  id: string
  title: string
  description: string
  url: string
  category: 'official' | 'tutorial' | 'reference' | 'course' | 'community'
  language?: string
  framework?: string
  tags: string[]
  icon?: string
}

interface DocCategory {
  id: string
  name: string
  icon: string
  resources: DocResource[]
}

interface DocumentationPanelProps {
  activeFile?: string | null
}

export function DocumentationPanel({ activeFile }: DocumentationPanelProps) {
  const [categories, setCategories] = useState<DocCategory[]>([])
  const [recommended, setRecommended] = useState<DocResource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['recommended']))
  const [activeTab, setActiveTab] = useState<'recommended' | 'all'>('recommended')

  useEffect(() => {
    loadDocumentation()
  }, [])

  useEffect(() => {
    if (activeFile) {
      loadRecommendations(activeFile)
    }
  }, [activeFile])

  const loadDocumentation = async () => {
    setLoading(true)
    try {
      const response = await api.getDocumentationCategories()
      if (response.success && response.data) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error("Error loading documentation:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async (file: string) => {
    try {
      const response = await api.getRecommendedDocs(file)
      if (response.success && response.data) {
        setRecommended(response.data.resources)
        // Auto-expandir recomendaciones si hay resultados
        if (response.data.resources.length > 0) {
          setExpandedCategories(new Set(['recommended']))
        }
      }
    } catch (error) {
      console.error("Error loading recommendations:", error)
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

  const expandAll = () => {
    const allIds = ['recommended', ...categories.map(c => c.id)]
    setExpandedCategories(new Set(allIds))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  const openResource = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getCategoryBadge = (category: DocResource['category']) => {
    const styles = {
      official: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      tutorial: 'bg-green-500/10 text-green-500 border-green-500/20',
      reference: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      course: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      community: 'bg-pink-500/10 text-pink-500 border-pink-500/20'
    }

    const labels = {
      official: 'Oficial',
      tutorial: 'Tutorial',
      reference: 'Referencia',
      course: 'Curso',
      community: 'Comunidad'
    }

    return (
      <Badge variant="outline" className={`text-xs ${styles[category]}`}>
        {labels[category]}
      </Badge>
    )
  }

  const filteredCategories = categories.map(cat => ({
    ...cat,
    resources: cat.resources.filter(r =>
      searchQuery === '' ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(cat => cat.resources.length > 0)

  const filteredRecommended = recommended.filter(r =>
    searchQuery === '' ||
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold">Recursos y Documentación</span>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-border p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar documentación..."
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
            Recomendado
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
            <BookOpen className="h-3 w-3" />
            Todos
          </div>
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Recommended Resources */}
          {activeTab === 'recommended' && (
            <>
              {activeFile && (
                <div className="mb-3 p-2 bg-blue-500/5 border border-blue-500/20 rounded-md">
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <Lightbulb className="h-3 w-3" />
                    <span>Recursos para: <code className="bg-blue-500/10 px-1 rounded">{activeFile.split('/').pop()}</code></span>
                  </div>
                </div>
              )}

              {filteredRecommended.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-sm font-semibold">
                    {activeFile ? 'Sin recursos recomendados' : 'Abre un archivo'}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    {activeFile 
                      ? 'No se encontraron recursos específicos para este tipo de archivo'
                      : 'Abre un archivo para ver recursos recomendados según el lenguaje'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRecommended.map((resource) => (
                    <ResourceItem
                      key={resource.id}
                      resource={resource}
                      onOpen={openResource}
                      getCategoryBadge={getCategoryBadge}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* All Resources by Category */}
          {activeTab === 'all' && (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs text-muted-foreground">
                  {filteredCategories.reduce((acc, cat) => acc + cat.resources.length, 0)} recursos
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAll}
                    className="h-6 px-2 text-xs"
                  >
                    Expandir
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAll}
                    className="h-6 px-2 text-xs"
                  >
                    Colapsar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {filteredCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id)

                  return (
                    <Collapsible
                      key={category.id}
                      open={isExpanded}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                          <span className="text-base">{category.icon}</span>
                          <span className="text-sm font-medium flex-1 text-left">
                            {category.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {category.resources.length}
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-2 mt-1 space-y-1">
                          {category.resources.map((resource) => (
                            <ResourceItem
                              key={resource.id}
                              resource={resource}
                              onOpen={openResource}
                              getCategoryBadge={getCategoryBadge}
                            />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}

                {filteredCategories.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No se encontraron recursos
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="border-t border-border p-3">
        <div className="rounded-md bg-muted/50 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">💡 Tip</p>
              <p>
                Más adelante aquí verás <strong>documentación personalizada</strong> con 
                tutoriales, ejemplos y guías creadas específicamente para EduIDE.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ResourceItemProps {
  resource: DocResource
  onOpen: (url: string) => void
  getCategoryBadge: (category: DocResource['category']) => JSX.Element
}

function ResourceItem({ resource, onOpen, getCategoryBadge }: ResourceItemProps) {
  return (
    <div className="group rounded-md border border-border p-3 hover:bg-accent transition-colors">
      <div className="flex items-start gap-2">
        {resource.icon && (
          <span className="text-xl flex-shrink-0">{resource.icon}</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium leading-tight">{resource.title}</h4>
            {getCategoryBadge(resource.category)}
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {resource.description}
          </p>
          
          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {resource.tags.slice(0, 3).map((tag) => (
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpen(resource.url)}
              className="h-7 text-xs gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Abrir Docs
            </Button>
            
            {/* URL Preview */}
            <span className="text-xs text-muted-foreground truncate flex-1">
              {new URL(resource.url).hostname}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

