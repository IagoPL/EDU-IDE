"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { FolderOpen, Plus, Trash2, Code2 } from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"

interface Project {
  id: string
  name: string
  type: string
  language: string
  description?: string
  createdAt: string
  lastModified: string
}

export function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const loadProjects = async () => {
    setLoading(true)
    const response = await api.getProjects()
    if (response.success && response.data) {
      setProjects(response.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleCreateProject = async () => {
    const name = prompt('Nombre del proyecto:')
    if (!name) return

    const type = prompt('Tipo (react/nodejs/python/html):')
    if (!type) return

    const language = prompt('Lenguaje (JavaScript/TypeScript/Python):')
    if (!language) return

    const response = await api.createProject({ name, type, language })
    if (response.success) {
      loadProjects()
    } else {
      alert(`Error: ${response.error}`)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return

    const response = await api.deleteProject(id)
    if (response.success) {
      loadProjects()
    } else {
      alert(`Error: ${response.error}`)
    }
  }

  const getProjectIcon = (type: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
      react: <Code2 className="h-6 w-6 text-blue-500" />,
      nodejs: <Code2 className="h-6 w-6 text-green-500" />,
      python: <Code2 className="h-6 w-6 text-yellow-500" />,
      html: <Code2 className="h-6 w-6 text-orange-500" />,
    }
    return icons[type] || <FolderOpen className="h-6 w-6 text-gray-500" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Proyectos</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus proyectos de programación</p>
        </div>
        <Button onClick={handleCreateProject} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando proyectos...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes proyectos</h3>
            <p className="text-sm text-muted-foreground mb-4">Crea tu primer proyecto para comenzar</p>
            <Button onClick={handleCreateProject} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Proyecto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="group relative overflow-hidden transition-all hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getProjectIcon(project.type)}
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {project.language} • {project.type}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {project.description || 'Sin descripción'}
                </p>
                <div className="flex gap-2">
                  <Button asChild className="flex-1" size="sm">
                    <Link href="/ide">Abrir</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


