"use client"

import { useState } from "react"
import { Bot, TerminalIcon, MessageSquare } from "lucide-react"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"

export function RightPanel() {
  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-card/95 backdrop-blur-sm overflow-hidden">
      <Tabs defaultValue="assistant" className="flex h-full flex-col overflow-hidden">
        <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b border-border bg-transparent">
          <TabsTrigger value="assistant" className="gap-2">
            <Bot className="h-4 w-4" />
            Asistente IA
          </TabsTrigger>
          <TabsTrigger value="terminal" className="gap-2">
            <TerminalIcon className="h-4 w-4" />
            Terminal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="flex-1 min-h-0 p-0 m-0 data-[state=active]:flex overflow-hidden">
          <AssistantPanel />
        </TabsContent>

        <TabsContent value="terminal" className="flex-1 min-h-0 p-0 m-0 data-[state=active]:flex overflow-hidden">
          <TerminalPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AssistantPanel() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hola! Soy tu asistente de programación. ¿En qué puedo ayudarte?" },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Entiendo tu pregunta. Déjame ayudarte con eso...",
        },
      ])
    }, 1000)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                  <MessageSquare className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Pregunta algo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend}>Enviar</Button>
        </div>
      </div>
    </div>
  )
}

function TerminalPanel() {
  const [output, setOutput] = useState(["$ Welcome to EduIDE Terminal", '$ Type "help" for available commands'])
  const [input, setInput] = useState("")

  const handleCommand = () => {
    if (!input.trim()) return
    const newOutput = [...output, `$ ${input}`]

    // Simple command simulation
    if (input === "help") {
      newOutput.push("Available commands: help, clear, ls, pwd")
    } else if (input === "clear") {
      setOutput([])
      setInput("")
      return
    } else if (input === "ls") {
      newOutput.push("src/  package.json  README.md")
    } else if (input === "pwd") {
      newOutput.push("/home/user/project")
    } else {
      newOutput.push(`Command not found: ${input}`)
    }

    setOutput(newOutput)
    setInput("")
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#1e1e1e] p-4 font-mono text-sm overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="space-y-1 text-green-400">
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-2 flex flex-shrink-0 items-center gap-2 text-green-400">
        <span>$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommand()}
          className="flex-1 bg-transparent outline-none"
          autoFocus
          aria-label="Terminal command input"
          placeholder="Enter command..."
        />
      </div>
    </div>
  )
}
