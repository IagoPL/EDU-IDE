"use client"

import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"

interface MonacoEditorProps {
  value: string
  language: string
  onChange?: (value: string) => void
  theme?: string
}

export function MonacoEditor({ value, language, onChange, theme = "vs-dark" }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Initialize Monaco Editor
    monacoEditorRef.current = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme,
      automaticLayout: false, // Disable to prevent ResizeObserver errors
      fontSize: 14,
      fontFamily: "var(--font-mono), 'JetBrains Mono', 'Consolas', monospace", // Updated to use correct font variable
      minimap: {
        enabled: true,
      },
      scrollBeyondLastLine: false,
      lineNumbers: "on",
      renderWhitespace: "selection",
      tabSize: 2,
      wordWrap: "on",
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      padding: {
        top: 16,
        bottom: 16,
      },
    })

    // Listen for content changes
    const disposable = monacoEditorRef.current.onDidChangeModelContent(() => {
      const currentValue = monacoEditorRef.current?.getValue() || ""
      onChange?.(currentValue)
    })

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      resizeTimeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          monacoEditorRef.current?.layout()
        })
      }, 100)
    })

    if (editorRef.current) {
      resizeObserver.observe(editorRef.current)
    }

    requestAnimationFrame(() => {
      monacoEditorRef.current?.layout()
    })

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeObserver.disconnect()
      disposable.dispose()
      monacoEditorRef.current?.dispose()
    }
  }, [])

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== value) {
      monacoEditorRef.current.setValue(value)
    }
  }, [value])

  // Update editor language when prop changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    }
  }, [language])

  return <div ref={editorRef} className="h-full w-full" />
}
