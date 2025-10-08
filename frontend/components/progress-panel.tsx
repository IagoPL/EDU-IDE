"use client"

import { useState, useEffect } from "react"
import {
  Trophy,
  Star,
  Code2,
  GitBranch,
  Bug,
  TestTube,
  Clock,
  TrendingUp,
  Award,
  Lock,
  CheckCircle2
} from "lucide-react"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Separator } from "./ui/separator"
import { api } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'code' | 'git' | 'testing' | 'debugging' | 'learning'
  requirement: number
  unlocked: boolean
  progress: number
  unlockedAt?: number
}

interface LanguageProgress {
  language: string
  linesWritten: number
  filesCreated: number
  timeSpent: number
  lastActive: number
  level: number
  experience: number
}

interface UserStats {
  totalLinesWritten: number
  totalFilesCreated: number
  totalTimeSpent: number
  languagesUsed: number
  achievementsUnlocked: number
  achievementsTotal: number
  joinedAt: number
  lastActive: number
}

export function ProgressPanel() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [languages, setLanguages] = useState<LanguageProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    setLoading(true)
    try {
      const [statsRes, userRes, langsRes] = await Promise.all([
        api.getProgressStats(),
        api.getUserProgress(),
        api.getLanguageProgress()
      ])

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      }

      if (userRes.success && userRes.data) {
        setAchievements(userRes.data.achievements || [])
      }

      if (langsRes.success && langsRes.data) {
        setLanguages(langsRes.data.languages || [])
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const pendingAchievements = achievements.filter(a => !a.unlocked)

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'code':
        return <Code2 className="h-4 w-4 text-blue-500" />
      case 'git':
        return <GitBranch className="h-4 w-4 text-orange-500" />
      case 'testing':
        return <TestTube className="h-4 w-4 text-green-500" />
      case 'debugging':
        return <Bug className="h-4 w-4 text-red-500" />
      case 'learning':
        return <Star className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getLanguageIcon = (language: string) => {
    const icons: { [key: string]: string } = {
      javascript: '📜',
      typescript: '📘',
      python: '🐍',
      java: '☕',
      html: '🌐',
      css: '🎨',
      cpp: '⚙️'
    }
    return icons[language.toLowerCase()] || '📄'
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-semibold">Tu Progreso</span>
        </div>
      </div>

      <Tabs defaultValue="achievements" className="flex h-full flex-col overflow-hidden">
        <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b border-border bg-transparent px-2">
          <TabsTrigger value="achievements" className="text-xs">
            <Trophy className="h-3 w-3 mr-1" />
            Logros
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="languages" className="text-xs">
            <Code2 className="h-3 w-3 mr-1" />
            Lenguajes
          </TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="flex-1 min-h-0 p-0 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              {/* Summary */}
              <div className="rounded-md border border-border p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Logros Desbloqueados</span>
                  <Badge variant="secondary">
                    {unlockedAchievements.length}/{achievements.length}
                  </Badge>
                </div>
                <Progress 
                  value={(unlockedAchievements.length / achievements.length) * 100} 
                  className="h-2"
                />
              </div>

              {/* Unlocked */}
              {unlockedAchievements.length > 0 && (
                <>
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                      DESBLOQUEADOS
                    </h3>
                    <div className="space-y-2">
                      {unlockedAchievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="rounded-md border border-border p-3 bg-gradient-to-r from-yellow-500/5 to-transparent"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl flex-shrink-0">{achievement.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium">{achievement.title}</h4>
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {achievement.description}
                              </p>
                              {achievement.unlockedAt && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {getCategoryIcon(achievement.category)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Pending */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                  POR DESBLOQUEAR
                </h3>
                <div className="space-y-2">
                  {pendingAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="rounded-md border border-border p-3 opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 grayscale">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{achievement.title}</h4>
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progreso</span>
                              <span>{achievement.progress}/{achievement.requirement}</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.requirement) * 100} 
                              className="h-1"
                            />
                          </div>
                        </div>
                        {getCategoryIcon(achievement.category)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="flex-1 min-h-0 p-0 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {stats && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard
                      icon={<Code2 className="h-4 w-4 text-blue-500" />}
                      label="Líneas Escritas"
                      value={stats.totalLinesWritten.toLocaleString()}
                    />
                    <StatCard
                      icon={<FileText className="h-4 w-4 text-green-500" />}
                      label="Archivos Creados"
                      value={stats.totalFilesCreated.toString()}
                    />
                    <StatCard
                      icon={<Clock className="h-4 w-4 text-orange-500" />}
                      label="Tiempo Total"
                      value={formatTime(stats.totalTimeSpent)}
                    />
                    <StatCard
                      icon={<Award className="h-4 w-4 text-yellow-500" />}
                      label="Logros"
                      value={`${stats.achievementsUnlocked}/${stats.achievementsTotal}`}
                    />
                  </div>

                  <Separator />

                  <div className="text-xs text-muted-foreground">
                    <p>Miembro desde: {new Date(stats.joinedAt).toLocaleDateString()}</p>
                    <p>Última actividad: {new Date(stats.lastActive).toLocaleDateString()}</p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages" className="flex-1 min-h-0 p-0 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {languages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Code2 className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Empieza a programar para ver tu progreso
                  </p>
                </div>
              ) : (
                languages.map((lang) => (
                  <div
                    key={lang.language}
                    className="rounded-md border border-border p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getLanguageIcon(lang.language)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium capitalize">{lang.language}</h4>
                          <Badge variant="secondary">Level {lang.level}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{lang.experience} XP</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Líneas</span>
                        <span className="font-medium">{lang.linesWritten.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Archivos</span>
                        <span className="font-medium">{lang.filesCreated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tiempo</span>
                        <span className="font-medium">{formatTime(lang.timeSpent)}</span>
                      </div>
                    </div>

                    {/* XP Progress to next level */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Nivel {lang.level}</span>
                        <span>{lang.experience % 1000}/1000 XP</span>
                      </div>
                      <Progress 
                        value={((lang.experience % 1000) / 1000) * 100} 
                        className="h-1"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}

