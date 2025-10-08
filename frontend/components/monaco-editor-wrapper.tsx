"use client"

import { useState, useEffect, lazy, Suspense, useRef, forwardRef, useImperativeHandle } from "react"
import { SimpleCodeEditor } from "./simple-code-editor"
import { Skeleton } from "./ui/skeleton"
import type { MonacoEditorHandle } from "./monaco-editor"

interface MonacoEditorProps {
  value: string
  language: string
  onChange?: (value: string) => void
  theme?: string
}

// Lazy load Monaco Editor - solo se carga cuando se usa
const MonacoEditor = lazy(() => import("./monaco-editor").then(mod => ({ default: mod.MonacoEditor })))

export const MonacoEditorWrapper = forwardRef<MonacoEditorHandle, MonacoEditorProps>(
  function MonacoEditorWrapper(props, ref) {
  const [useMonaco, setUseMonaco] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const editorRef = useRef<MonacoEditorHandle>(null)

  // Exponer métodos del editor
  useImperativeHandle(ref, () => ({
    goToLine: (line: number) => {
      editorRef.current?.goToLine(line)
    },
    getEditor: () => {
      return editorRef.current?.getEditor() || null
    },
    getTotalLines: () => {
      return editorRef.current?.getTotalLines() || 0
    }
  }))

  // Detectar si debemos usar Monaco basado en el tamaño del archivo o preferencias
  useEffect(() => {
    // Usar Monaco automáticamente para archivos grandes o lenguajes que necesitan IntelliSense
    const needsMonaco = props.value.length > 500 || 
                       ['typescript', 'javascript', 'python', 'java'].includes(props.language)
    
    if (needsMonaco && !useMonaco && !isLoading) {
      setIsLoading(true)
      // Pequeño delay para no bloquear el renderizado inicial
      setTimeout(() => {
        setUseMonaco(true)
        setIsLoading(false)
      }, 100)
    }
  }, [props.value.length, props.language])

  // Fallback mientras carga Monaco
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Cargando editor avanzado...</p>
        </div>
      </div>
    )
  }

  // Usar Monaco si está habilitado
  if (useMonaco) {
    return (
      <Suspense fallback={
        <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e]">
          <Skeleton className="h-full w-full" />
        </div>
      }>
        <MonacoEditor ref={editorRef} {...props} />
      </Suspense>
    )
  }

  // Usar editor simple por defecto para mejor rendimiento inicial
  return <SimpleCodeEditor {...props} />
})

