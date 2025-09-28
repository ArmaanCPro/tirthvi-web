'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useChat } from '@ai-sdk/react'
import { Conversation, ConversationContent } from '@/components/ui/shadcn-io/ai/conversation'
import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import { Response } from '@/components/ui/shadcn-io/ai/response'
import { PromptInput, PromptInputTextarea } from '@/components/ui/shadcn-io/ai/prompt-input'
import { Loader } from '@/components/ui/shadcn-io/ai/loader'
import { Actions } from '@/components/ui/shadcn-io/ai/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { ConversationSidebar } from '@/components/conversation-sidebar'
import { ChatErrorBoundary } from '@/components/chat-error-boundary'
import { TypingIndicator } from '@/components/typing-indicator'

interface UsageStats {
  messagesCount: number
  tokensUsed: number
  messagesRemaining: number
  tokensRemaining: number
  isLimitReached: boolean
}

export default function ChatPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [input, setInput] = useState('')
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, sendMessage, status, setMessages } = useChat({
    onError: (error) => {
      console.error('Chat error:', error)
      setError(error.message)
      
      if (error.message.includes('429')) {
        // Rate limit reached
        setUsageStats(prev => prev ? { ...prev, isLimitReached: true } : null)
      }
    },
    onFinish: () => {
      setError(null)
    }
  })

  // Fetch usage stats
  useEffect(() => {
    if (isSignedIn) {
      fetchUsageStats()
    }
  }, [isSignedIn])

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const stats = await response.json()
        setUsageStats(stats)
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    }
  }

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`)
      if (response.ok) {
        const conversation = await response.json()
        // Convert conversation messages to chat format
        const chatMessages = conversation.messages.map((msg: { id: string; role: string; content: string }) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          parts: [{ type: 'text', text: msg.content }]
        }))
        setMessages(chatMessages)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }, [setMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversation when conversation ID changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId)
    }
  }, [currentConversationId, loadConversation])

  const handleNewConversation = () => {
    setMessages([])
    setCurrentConversationId(undefined)
  }

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId)
  }

  const handleRetry = () => {
    setError(null)
    // Retry the last message
    const lastUserMessage = messages[messages.length - 1]
    if (lastUserMessage?.role === 'user') {
      const textPart = lastUserMessage.parts.find(part => part.type === 'text')
      if (textPart && 'text' in textPart) {
        sendMessage({
          role: 'user',
          parts: [{ type: 'text', text: textPart.text }]
        })
      }
    }
  }

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-[600px]">
          <Loader />
        </div>
      </div>
    )
  }

  // Show sign-in prompt if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Hindu Philosophy Assistant</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to access the AI assistant
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to use the Hindu Philosophy Assistant.
              </p>
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !usageStats?.isLimitReached) {
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: input }]
      })
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as React.FormEvent)
    }
  }

  return (
    <ChatErrorBoundary>
      <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 border-r">
          <ConversationSidebar
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
          />
        </div>
      )}
      
      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Card className="h-[calc(100vh-3rem)] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </Button>
                  <div>
                    <CardTitle>Hindu Philosophy Assistant</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ask questions about Hindu philosophy, festivals, scriptures, and traditions
                    </p>
                  </div>
                </div>
                {usageStats && (
                  <div className="flex gap-2">
                    <Badge variant={usageStats.isLimitReached ? "destructive" : "secondary"}>
                      {usageStats.messagesRemaining} messages left
                    </Badge>
                    {usageStats.isLimitReached && (
                      <Badge variant="destructive">
                        Daily limit reached
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <Conversation className="flex-1">
            <ConversationContent>
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Welcome to the Hindu Philosophy Assistant</h3>
                      <p className="text-sm">Ask me anything about Hindu philosophy, festivals, or traditions.</p>
                    </div>
                  </div>
                )}
                
                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive">
                          {error.includes('429') 
                            ? 'Daily limit reached. Try again tomorrow.' 
                            : error.includes('Network') 
                            ? 'Network error. Please check your connection.'
                            : 'Something went wrong. Please try again.'
                          }
                        </span>
                      </div>
                      {error.includes('Network') && (
                        <Button size="sm" variant="outline" onClick={handleRetry}>
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, index) => {
                      if (part.type === 'text') {
                        return <Response key={index}>{part.text}</Response>
                      }
                      return null
                    })}
                  </MessageContent>
                  {message.role === 'assistant' && (
                    <Actions>
                      <button
                        onClick={() => {
                          // Regenerate response
                          const lastUserMessage = messages[messages.length - 2]
                          if (lastUserMessage?.role === 'user') {
                            const textPart = lastUserMessage.parts.find(part => part.type === 'text')
                            if (textPart && 'text' in textPart) {
                              sendMessage({
                                role: 'user',
                                parts: [{ type: 'text', text: textPart.text }]
                              })
                            }
                          }
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={() => {
                          const textParts = message.parts
                            .filter(part => part.type === 'text' && 'text' in part)
                            .map(part => (part as { text: string }).text)
                          navigator.clipboard.writeText(textParts.join(''))
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Copy
                      </button>
                    </Actions>
                  )}
                </Message>
              ))}
              <TypingIndicator isTyping={status === 'streaming'} />
              <div ref={messagesEndRef} />
            </ConversationContent>
          </Conversation>
          <div className="mt-4">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  usageStats?.isLimitReached 
                    ? "Daily limit reached. Try again tomorrow." 
                    : "Ask about Hindu philosophy, festivals, or traditions... (Enter to send, Shift+Enter for new line)"
                }
                disabled={status === 'streaming' || usageStats?.isLimitReached}
              />
            </PromptInput>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  </div>
  </ChatErrorBoundary>
  )
}
