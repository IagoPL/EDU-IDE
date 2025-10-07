"use client"

import { useRef } from "react"
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react"
import type { editor } from "monaco-editor"

interface MonacoEditorProps {
  value: string
  language: string
  onChange?: (value: string) => void
  theme?: string
}

export function MonacoEditor({ value, language, onChange, theme = "vs-dark" }: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorWillMount: BeforeMount = (monaco) => {
    // Configurar opciones globales de Monaco antes de que se monte
    
    // JavaScript/TypeScript - opciones de diagnóstico
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
    
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    })

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    })
  }

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Configurar opciones del editor
    editor.updateOptions({
      fontSize: 14,
      fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", "Courier New", monospace',
      fontLigatures: true,
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      minimap: {
        enabled: true,
        scale: 1,
      },
      folding: true,
      foldingStrategy: "indentation",
      showFoldingControls: "always",
      automaticLayout: true,
      wordWrap: "on",
      wrappingIndent: "indent",
      scrollbar: {
        vertical: "visible",
        horizontal: "visible",
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: true,
      trimAutoWhitespace: true,
      formatOnPaste: true,
      formatOnType: true,
      autoClosingBrackets: "languageDefined",
      autoClosingQuotes: "languageDefined",
      autoSurround: "languageDefined",
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      snippetSuggestions: "inline",
      wordBasedSuggestions: "currentDocument",
      bracketPairColorization: {
        enabled: true,
      },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      padding: {
        top: 16,
        bottom: 16,
      },
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: "never",
        seedSearchStringFromSelection: "selection",
      },
    })

    // Focus en el editor
    editor.focus()
  }

  const handleChange = (newValue: string | undefined) => {
    if (onChange && newValue !== undefined) {
      onChange(newValue)
    }
  }

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      onChange={handleChange}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      loading={
        <div className="flex h-full items-center justify-center">
          <div className="text-sm text-muted-foreground">Cargando editor...</div>
        </div>
      }
      options={{
        fontSize: 14,
        fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", "Courier New", monospace',
        fontLigatures: true,
        lineNumbers: "on",
        minimap: { enabled: true },
        automaticLayout: true,
        wordWrap: "on",
        scrollBeyondLastLine: false,
      }}
    />
  )
}
