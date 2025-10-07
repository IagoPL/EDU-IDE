"use client"

import { useEffect, useRef, useState } from "react"
import "@xterm/xterm/css/xterm.css"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface TerminalProps {
  onCommand?: (command: string) => void
  onClose?: () => void
  title?: string
}

export function Terminal({ onCommand, onClose, title = "Terminal" }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<any | null>(null)
  const fitAddonRef = useRef<any | null>(null)
  const [currentLine, setCurrentLine] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!terminalRef.current || isLoaded) return

    // Importación dinámica solo en cliente
    Promise.all([
      import("@xterm/xterm").then(mod => mod.Terminal),
      import("@xterm/addon-fit").then(mod => mod.FitAddon),
      import("@xterm/addon-web-links").then(mod => mod.WebLinksAddon)
    ]).then(([XTerm, FitAddon, WebLinksAddon]) => {
      if (!terminalRef.current) return
      
      setIsLoaded(true)

      // Crear instancia de xterm
      const term = new XTerm({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize: 14,
      fontFamily: "var(--font-mono), 'JetBrains Mono', 'Consolas', monospace",
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#d4d4d4",
        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#e5e5e5",
      },
      allowProposedApi: true,
    })

    // Agregar addons
    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)

    // Abrir terminal en el DOM
    term.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Escribir prompt inicial
    writePrompt(term)

    // Manejar entrada de usuario
    let currentInput = ""
    
    term.onData((data) => {
      const code = data.charCodeAt(0)

      // Enter
      if (code === 13) {
        term.write("\r\n")
        
        if (currentInput.trim()) {
          // Ejecutar comando
          onCommand?.(currentInput)
          
          // Agregar al historial
          setCommandHistory(prev => [...prev, currentInput])
          setHistoryIndex(-1)
        }
        
        currentInput = ""
        setCurrentLine("")
        writePrompt(term)
      }
      // Backspace
      else if (code === 127) {
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1)
          setCurrentLine(currentInput)
          term.write("\b \b")
        }
      }
      // Ctrl+C
      else if (code === 3) {
        term.write("^C\r\n")
        currentInput = ""
        setCurrentLine("")
        writePrompt(term)
      }
      // Ctrl+L (clear)
      else if (code === 12) {
        term.clear()
        writePrompt(term)
      }
      // Arrow Up (historial hacia atrás)
      else if (data === "\x1b[A") {
        if (commandHistory.length > 0) {
          const newIndex = historyIndex === -1 
            ? commandHistory.length - 1 
            : Math.max(0, historyIndex - 1)
          
          setHistoryIndex(newIndex)
          const historyCommand = commandHistory[newIndex]
          
          // Limpiar línea actual
          term.write("\r\x1b[K")
          writePrompt(term)
          term.write(historyCommand)
          currentInput = historyCommand
          setCurrentLine(historyCommand)
        }
      }
      // Arrow Down (historial hacia adelante)
      else if (data === "\x1b[B") {
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1
          
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1)
            currentInput = ""
            setCurrentLine("")
            term.write("\r\x1b[K")
            writePrompt(term)
          } else {
            setHistoryIndex(newIndex)
            const historyCommand = commandHistory[newIndex]
            term.write("\r\x1b[K")
            writePrompt(term)
            term.write(historyCommand)
            currentInput = historyCommand
            setCurrentLine(historyCommand)
          }
        }
      }
      // Caracteres normales
      else if (code >= 32 && code < 127) {
        currentInput += data
        setCurrentLine(currentInput)
        term.write(data)
      }
    })

    // Ajustar tamaño en resize
    const handleResize = () => {
      fitAddon.fit()
    }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        term.dispose()
      }
    }).catch(error => {
      console.error("Error cargando terminal:", error)
    })

    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose()
      }
    }
  }, [isLoaded])

  // Actualizar historial cuando cambia
  useEffect(() => {
    if (xtermRef.current && historyIndex === -1) {
      setCurrentLine("")
    }
  }, [historyIndex])

  const writePrompt = (term: any) => {
    term.write("\r\n\x1b[32m$\x1b[0m ")
  }

  // Método público para escribir en el terminal
  const write = (text: string) => {
    if (xtermRef.current) {
      xtermRef.current.write(text)
    }
  }

  // Método público para escribir una línea
  const writeln = (text: string) => {
    if (xtermRef.current) {
      xtermRef.current.writeln(text)
    }
  }

  // Método público para limpiar
  const clear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear()
      writePrompt(xtermRef.current)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <span className="text-sm font-medium">{title}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Terminal Container */}
      <div 
        ref={terminalRef} 
        className="flex-1 p-2 overflow-hidden"
        style={{ minHeight: 0 }}
      />
    </div>
  )
}

// Exportar métodos públicos como utilidades (solo cliente)
export const createTerminal = async (container: HTMLElement) => {
  const [XTerm, FitAddon] = await Promise.all([
    import("@xterm/xterm").then(mod => mod.Terminal),
    import("@xterm/addon-fit").then(mod => mod.FitAddon)
  ])
  
  const term = new XTerm({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: "monospace",
  })
  
  const fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  
  term.open(container)
  fitAddon.fit()
  
  return { term, fitAddon }
}
