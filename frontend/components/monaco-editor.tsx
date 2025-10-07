"use client"

import { useEffect, useRef, useState } from "react"
import type * as Monaco from "monaco-editor"

interface MonacoEditorProps {
  value: string
  language: string
  onChange?: (value: string) => void
  theme?: string
}

export function MonacoEditor({ value, language, onChange, theme = "vs-dark" }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [monaco, setMonaco] = useState<typeof Monaco | null>(null)

  // Cargar Monaco solo en el cliente
  useEffect(() => {
    const loadMonaco = async () => {
      if (typeof window !== "undefined") {
        // Configurar Monaco Environment ANTES de importar con workers optimizados
        (window as any).MonacoEnvironment = {
          getWorker(_: string, label: string) {
            // Usar web workers para mejor rendimiento
            const getWorkerModule = (moduleUrl: string, label: string) => {
              return new Worker(
                new URL(`monaco-editor/esm/vs/language/${label}/${label}.worker?worker`, import.meta.url),
                { type: 'module' }
              )
            }

            switch (label) {
              case 'json':
                return getWorkerModule('/json/', label)
              case 'css':
              case 'scss':
              case 'less':
                return getWorkerModule('/css/', label)
              case 'html':
              case 'handlebars':
              case 'razor':
                return getWorkerModule('/html/', label)
              case 'typescript':
              case 'javascript':
                return getWorkerModule('/typescript/', 'ts')
              default:
                // Editor worker por defecto
                return new Worker(
                  new URL('monaco-editor/esm/vs/editor/editor.worker?worker', import.meta.url),
                  { type: 'module' }
                )
            }
          },
        }

        const monacoModule = await import("monaco-editor")
        
        // Configurar opciones globales de Monaco
        monacoModule.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        })
        
        monacoModule.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monacoModule.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monacoModule.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monacoModule.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monacoModule.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
          typeRoots: ['node_modules/@types'],
        })

        monacoModule.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        })
        
        monacoModule.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monacoModule.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monacoModule.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monacoModule.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monacoModule.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          typeRoots: ['node_modules/@types'],
        })
        
        setMonaco(monacoModule)
      }
    }

    loadMonaco()
  }, [])

  useEffect(() => {
    if (!editorRef.current || !monaco) return

    // Initialize Monaco Editor con configuración avanzada
    monacoEditorRef.current = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme,
      automaticLayout: false, // Disable to prevent ResizeObserver errors
      fontSize: 14,
      fontFamily: "var(--font-mono), 'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontLigatures: true, // Habilitar ligaduras de fuente
      minimap: {
        enabled: true,
        scale: 1,
        showSlider: "mouseover",
      },
      scrollBeyondLastLine: false,
      lineNumbers: "on",
      renderWhitespace: "selection",
      tabSize: 2,
      insertSpaces: true,
      wordWrap: "on",
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      padding: {
        top: 16,
        bottom: 16,
      },
      // Características avanzadas
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: "on",
      snippetSuggestions: "inline",
      wordBasedSuggestions: "matchingDocuments",
      parameterHints: {
        enabled: true,
        cycle: true,
      },
      // Bracket matching
      matchBrackets: "always",
      bracketPairColorization: {
        enabled: true,
        independentColorPoolPerBracketType: true,
      },
      // Code folding
      folding: true,
      foldingStrategy: "indentation",
      foldingHighlight: true,
      unfoldOnClickAfterEndOfLine: true,
      showFoldingControls: "mouseover",
      // Find & Replace
      find: {
        addExtraSpaceOnTop: true,
        autoFindInSelection: "never",
        seedSearchStringFromSelection: "always",
      },
      // Gutter
      glyphMargin: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      // Scrollbar
      scrollbar: {
        vertical: "auto",
        horizontal: "auto",
        useShadows: true,
        verticalScrollbarSize: 12,
        horizontalScrollbarSize: 12,
      },
      // Otros
      contextmenu: true,
      mouseWheelZoom: true,
      formatOnPaste: true,
      formatOnType: true,
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      autoIndent: "full",
      links: true,
      colorDecorators: true,
      lightbulb: {
        enabled: "on",
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
  }, [monaco])

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoEditorRef.current && monacoEditorRef.current.getValue() !== value) {
      monacoEditorRef.current.setValue(value)
    }
  }, [value])

  // Update editor language when prop changes
  useEffect(() => {
    if (monacoEditorRef.current && monaco) {
      const model = monacoEditorRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    }
  }, [language, monaco])

  return <div ref={editorRef} className="h-full w-full" />
}
