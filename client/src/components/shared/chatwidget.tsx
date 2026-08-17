'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const AI_ENGINE_URL = 'https://dravya-ai-engine.onrender.com'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    text: 'Welcome to Dravya! 🌿 Ask anything about herbs, batches, farmers, or inventory in English, Hindi, or Hinglish.',
  },
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, open])

  // Close the widget when clicking anywhere outside it
  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    const userMsg: ChatMessage = { id: `m${Date.now()}`, role: 'user', text: userMessage }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch(`${AI_ENGINE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationIdRef.current ?? undefined,
        }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()
     
      if (data.conversation_id) {
        conversationIdRef.current = data.conversation_id
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m${Date.now() + 1}`,
          role: 'assistant',
          text: data.answer ?? 'Answer not found',
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `m${Date.now() + 1}`,
          role: 'assistant',
          text: "⚠️ Couldn't connect to the server. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div ref={widgetRef} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat box */}
      {open && (
        <div className="flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-[#184E48]/20 bg-white shadow-2xl sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#184E48] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md ">
                <img src="/logo-out.png" alt="Open chat" className=" rounded-full object-cover" />
              </div>
              <span className="text-sm font-semibold text-white">Dravya Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-7 w-7 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#F7F4EC] px-3 py-4">
          
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="mr-2 h-6 w-6 shrink-0 bg-[#184E48]">
                      <AvatarFallback className="bg-[#184E48]">
                        <img src="/logo-out.png" alt="Open chat" className=" rounded-full object-cover" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[78%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-[#184E48] text-white'
                        : 'rounded-tl-sm border border-[#184E48]/10 bg-white text-[#1C2422] shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start justify-start">
                  <Avatar className="mr-2 h-6 w-6 shrink-0 bg-[#184E48]">
                    <AvatarFallback className="bg-[#184E48]">
                      <img src="/logo-out.png" alt="typing" className="rounded-full object-cover" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-tl-sm border border-[#184E48]/10 bg-white px-4 py-3 shadow-sm">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#184E48]/50 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#184E48]/50 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#184E48]/50 [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-[#184E48]/10 bg-white px-3 py-3">
            <div className="flex items-end gap-2 rounded-2xl border border-[#184E48]/15 bg-[#F7F4EC] px-2.5 py-1.5 focus-within:border-[#184E48]">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type here.."
                className="max-h-24 min-h-0 flex-1 resize-none border-none bg-transparent py-1 text-sm shadow-none placeholder:text-[#184E48]/40 focus-visible:ring-0"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-7 w-7 shrink-0 rounded-full bg-[#184E48] text-white hover:bg-accent disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <Button
        onClick={() => setOpen((v) => !v)}
        size="icon"
        className="h-20 w-20 rounded-full bg-[#184E48] text-white shadow-lg hover:bg-[#184E48]/90 hover:scale-105 transition-all duration-300"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <X className="h-10 w-10" />
        ) : (
          <img src="/logo-out.png" alt="Open chat" className=" rounded-full object-cover" />
        )}
      </Button>
    </div>
  )
}