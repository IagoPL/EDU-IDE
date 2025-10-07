"use client"

import { useEffect, useRef } from "react"

interface SimpleCodeEditorProps {
  value: string
  language: string
  onChange?: (value: string) => void
  theme?: string
}

export function SimpleCodeEditor({ value, language, onChange }: SimpleCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = textarea.value.substring(0, start) + "  " + textarea.value.substring(end)
      textarea.value = newValue
      textarea.selectionStart = textarea.selectionEnd = start + 2
      onChange?.(newValue)
    }
  }

  return (
    <textarea
      ref={textareaRef}
      defaultValue={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="h-full w-full resize-none bg-[#1e1e1e] p-4 font-mono text-sm text-gray-100 focus:outline-none"
      style={{
        tabSize: 2,
        lineHeight: "1.6",
        caretColor: "#ffffff",
      }}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      aria-label="Code editor"
      placeholder="Start coding..."
    />
  )
}


