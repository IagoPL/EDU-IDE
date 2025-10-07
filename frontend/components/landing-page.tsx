"use client"

import type React from "react"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Code2, Sparkles, Terminal, Users, Zap, BookOpen, Rocket, FileCode } from "lucide-react"
import Link from "next/link"
import { ProjectsPanel } from "./projects-panel"

export function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              EduIDE
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/ide">Abrir IDE</Link>
            </Button>
            <Button asChild>
              <Link href="/ide">Comenzar</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>IDE Educativo de Nueva Generación</span>
          </div>

          <h1 className="bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 bg-clip-text text-5xl font-bold leading-tight text-transparent md:text-7xl">
            Aprende a Programar con EduIDE
          </h1>

          <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            Un entorno de desarrollo integrado moderno diseñado específicamente para estudiantes. Escribe, ejecuta y
            aprende código con asistencia de IA en tiempo real.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/ide">
                <Rocket className="h-5 w-5" />
                Comenzar Ahora
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent">
              <BookOpen className="h-5 w-5" />
              Ver Documentación
            </Button>
          </div>

          {/* Preview Image Placeholder */}
          <div className="relative mx-auto mt-12 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div className="aspect-video w-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20">
              <div className="flex h-full items-center justify-center">
                <Code2 className="h-24 w-24 text-muted-foreground/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Características Principales</h2>
          <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
            Todo lo que necesitas para aprender programación en un solo lugar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Code2 className="h-8 w-8 text-blue-500" />}
            title="Editor Inteligente"
            description="Editor Monaco con resaltado de sintaxis, autocompletado y detección de errores en tiempo real."
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-purple-500" />}
            title="Asistente IA"
            description="Obtén ayuda instantánea con tu código. El asistente IA responde preguntas y sugiere mejoras."
          />
          <FeatureCard
            icon={<Terminal className="h-8 w-8 text-green-500" />}
            title="Terminal Integrada"
            description="Ejecuta comandos y prueba tu código directamente desde el IDE sin cambiar de ventana."
          />
          <FeatureCard
            icon={<FileCode className="h-8 w-8 text-yellow-500" />}
            title="Múltiples Lenguajes"
            description="Soporte para JavaScript, Python, Java, C++ y muchos más lenguajes de programación."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-pink-500" />}
            title="Colaboración"
            description="Comparte proyectos y colabora con otros estudiantes en tiempo real."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-orange-500" />}
            title="Ejecución Rápida"
            description="Ejecuta tu código al instante y ve los resultados inmediatamente en la consola."
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Comienza en Segundos</h2>
          <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
            Elige una plantilla o comienza desde cero
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <QuickActionCard
            title="JavaScript Básico"
            description="Aprende los fundamentos de JavaScript con ejemplos interactivos"
            language="JavaScript"
            color="yellow"
          />
          <QuickActionCard
            title="Python para Principiantes"
            description="Comienza tu viaje en programación con Python"
            language="Python"
            color="blue"
          />
          <QuickActionCard
            title="HTML & CSS"
            description="Crea tu primera página web desde cero"
            language="HTML/CSS"
            color="orange"
          />
        </div>
      </section>

      {/* Projects Section */}
      <section className="container mx-auto px-4 py-12">
        <ProjectsPanel />
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl border border-border bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">¿Listo para Comenzar?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-balance text-lg text-muted-foreground">
            Únete a miles de estudiantes que ya están aprendiendo a programar con EduIDE
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/ide">
              <Rocket className="h-5 w-5" />
              Abrir EduIDE Ahora
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 EduIDE. Hecho con ❤️ para estudiantes de programación.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="transition-all hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({
  title,
  description,
  language,
  color,
}: {
  title: string
  description: string
  language: string
  color: string
}) {
  const colorClasses = {
    yellow: "from-yellow-500/20 to-orange-500/20 border-yellow-500/20",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/20",
    orange: "from-orange-500/20 to-red-500/20 border-orange-500/20",
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <CardHeader>
        <div className="mb-2 inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {language}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 text-base">{description}</CardDescription>
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/ide">Comenzar Proyecto</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
