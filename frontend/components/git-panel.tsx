"use client"

import { useState, useEffect } from "react"
import { GitBranch, GitCommit, GitPullRequest, RefreshCw, Plus, Check, X, Circle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface GitFile {
  path: string
  status: string
  staged: boolean
}

interface GitCommit {
  hash: string
  author: string
  email: string
  date: string
  message: string
}

interface GitBranch {
  name: string
  current: boolean
  commit: string
}

type GitTab = "changes" | "commits" | "branches"

export function GitPanel() {
  const [activeTab, setActiveTab] = useState<GitTab>("changes")
  const [files, setFiles] = useState<GitFile[]>([])
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [branches, setBranches] = useState<GitBranch[]>([])
  const [commitMessage, setCommitMessage] = useState("")
  const [newBranchName, setNewBranchName] = useState("")
  const [loading, setLoading] = useState(false)
  const [isGitRepo, setIsGitRepo] = useState(true)

  useEffect(() => {
    loadGitData()
  }, [activeTab])

  const loadGitData = async () => {
    setLoading(true)
    try {
      if (activeTab === "changes") {
        await loadStatus()
      } else if (activeTab === "commits") {
        await loadCommits()
      } else if (activeTab === "branches") {
        await loadBranches()
      }
    } catch (error) {
      console.error("Error loading Git data:", error)
      setIsGitRepo(false)
    } finally {
      setLoading(false)
    }
  }

  const loadStatus = async () => {
    const response = await api.getGitStatus()
    if (response) {
      setFiles(response.files)
      setIsGitRepo(true)
    }
  }

  const loadCommits = async () => {
    const response = await api.gitLog(50)
    if (response) {
      setCommits(response.commits)
    }
  }

  const loadBranches = async () => {
    const response = await api.gitGetBranches()
    if (response) {
      setBranches(response.branches)
    }
  }

  const handleStageFile = async (file: GitFile) => {
    try {
      await api.gitAdd([file.path])
      await loadStatus()
    } catch (error) {
      console.error("Error staging file:", error)
    }
  }

  const handleUnstageFile = async (file: GitFile) => {
    try {
      await api.gitUnstage(file.path)
      await loadStatus()
    } catch (error) {
      console.error("Error unstaging file:", error)
    }
  }

  const handleStageAll = async () => {
    try {
      await api.gitAdd(["."])
      await loadStatus()
    } catch (error) {
      console.error("Error staging all:", error)
    }
  }

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      alert("Por favor ingresa un mensaje de commit")
      return
    }

    try {
      await api.gitCommit(commitMessage)
      setCommitMessage("")
      await loadStatus()
      alert("Commit creado correctamente")
    } catch (error) {
      console.error("Error creating commit:", error)
      alert("Error al crear commit")
    }
  }

  const handlePush = async () => {
    try {
      setLoading(true)
      await api.gitPush()
      alert("Push realizado correctamente")
    } catch (error) {
      console.error("Error pushing:", error)
      alert("Error al hacer push")
    } finally {
      setLoading(false)
    }
  }

  const handlePull = async () => {
    try {
      setLoading(true)
      await api.gitPull()
      await loadStatus()
      alert("Pull realizado correctamente")
    } catch (error) {
      console.error("Error pulling:", error)
      alert("Error al hacer pull")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      alert("Por favor ingresa un nombre para el branch")
      return
    }

    try {
      await api.gitCreateBranch(newBranchName)
      setNewBranchName("")
      await loadBranches()
      alert(`Branch '${newBranchName}' creado correctamente`)
    } catch (error) {
      console.error("Error creating branch:", error)
      alert("Error al crear branch")
    }
  }

  const handleCheckoutBranch = async (branchName: string) => {
    try {
      await api.gitCheckout(branchName)
      await loadBranches()
      await loadStatus()
      alert(`Cambiado a branch '${branchName}'`)
    } catch (error) {
      console.error("Error checking out branch:", error)
      alert("Error al cambiar de branch")
    }
  }

  const handleDeleteBranch = async (branchName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el branch '${branchName}'?`)) {
      return
    }

    try {
      await api.gitDeleteBranch(branchName)
      await loadBranches()
      alert(`Branch '${branchName}' eliminado`)
    } catch (error) {
      console.error("Error deleting branch:", error)
      alert("Error al eliminar branch")
    }
  }

  const handleInitGit = async () => {
    try {
      await api.gitInit()
      setIsGitRepo(true)
      await loadStatus()
      alert("Repositorio Git inicializado")
    } catch (error) {
      console.error("Error initializing Git:", error)
      alert("Error al inicializar Git")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "M":
        return <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
      case "A":
        return <Circle className="h-3 w-3 fill-green-500 text-green-500" />
      case "D":
        return <Circle className="h-3 w-3 fill-red-500 text-red-500" />
      case "U":
        return <Circle className="h-3 w-3 fill-gray-500 text-gray-500" />
      case "R":
        return <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
      default:
        return <Circle className="h-3 w-3" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "M":
        return "Modificado"
      case "A":
        return "Agregado"
      case "D":
        return "Eliminado"
      case "U":
        return "Sin rastrear"
      case "R":
        return "Renombrado"
      default:
        return status
    }
  }

  if (!isGitRepo) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <GitBranch className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No es un repositorio Git</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Este workspace no está inicializado como repositorio Git
        </p>
        <Button onClick={handleInitGit}>Inicializar Git</Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("changes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
            activeTab === "changes"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitBranch className="h-4 w-4" />
          Cambios
          {files.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {files.length}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("commits")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
            activeTab === "commits"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitCommit className="h-4 w-4" />
          Commits
        </button>

        <button
          onClick={() => setActiveTab("branches")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
            activeTab === "branches"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitPullRequest className="h-4 w-4" />
          Branches
        </button>

        <div className="ml-auto flex items-center gap-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadGitData}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "changes" && (
          <div className="flex h-full flex-col">
            {/* Commit Section */}
            <div className="border-b border-border p-3">
              <Textarea
                placeholder="Mensaje de commit..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="mb-2 min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCommit}
                  disabled={!commitMessage.trim() || files.filter((f) => f.staged).length === 0}
                  className="flex-1"
                  size="sm"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Commit
                </Button>
                <Button onClick={handlePush} variant="outline" size="sm" disabled={loading}>
                  Push
                </Button>
                <Button onClick={handlePull} variant="outline" size="sm" disabled={loading}>
                  Pull
                </Button>
              </div>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {files.filter((f) => f.staged).length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between px-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">
                        STAGING ({files.filter((f) => f.staged).length})
                      </h4>
                    </div>
                    {files
                      .filter((f) => f.staged)
                      .map((file) => (
                        <div
                          key={file.path}
                          className="group flex items-center justify-between rounded px-2 py-1 hover:bg-accent"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(file.status)}
                            <span className="text-sm">{file.path}</span>
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(file.status)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnstageFile(file)}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}

                {files.filter((f) => !f.staged).length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between px-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">
                        CAMBIOS ({files.filter((f) => !f.staged).length})
                      </h4>
                      <Button variant="ghost" size="sm" onClick={handleStageAll}>
                        <Plus className="mr-1 h-3 w-3" />
                        Stage All
                      </Button>
                    </div>
                    {files
                      .filter((f) => !f.staged)
                      .map((file) => (
                        <div
                          key={file.path}
                          className="group flex items-center justify-between rounded px-2 py-1 hover:bg-accent"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(file.status)}
                            <span className="text-sm">{file.path}</span>
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(file.status)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStageFile(file)}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}

                {files.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Check className="mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No hay cambios</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === "commits" && (
          <ScrollArea className="h-full">
            <div className="p-2">
              {commits.map((commit) => (
                <div
                  key={commit.hash}
                  className="mb-3 rounded border border-border p-3 hover:bg-accent"
                >
                  <div className="mb-1 flex items-start justify-between">
                    <p className="text-sm font-medium">{commit.message}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{commit.author}</span>
                    <span>•</span>
                    <span>{new Date(commit.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <code className="rounded bg-muted px-1">{commit.hash.substring(0, 7)}</code>
                  </div>
                </div>
              ))}

              {commits.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GitCommit className="mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No hay commits aún</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {activeTab === "branches" && (
          <div className="flex h-full flex-col">
            <div className="border-b border-border p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre del nuevo branch..."
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateBranch()}
                />
                <Button onClick={handleCreateBranch} disabled={!newBranchName.trim()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {branches.map((branch) => (
                  <div
                    key={branch.name}
                    className={cn(
                      "group flex items-center justify-between rounded px-2 py-2 hover:bg-accent",
                      branch.current && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <span className={cn("text-sm", branch.current && "font-semibold")}>
                        {branch.name}
                      </span>
                      {branch.current && (
                        <Badge variant="default" className="text-xs">
                          Actual
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      {!branch.current && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckoutBranch(branch.name)}
                          >
                            Cambiar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBranch(branch.name)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {branches.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <GitPullRequest className="mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No hay branches</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}

