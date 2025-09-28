'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useChat } from '@ai-sdk/react'
import { Conversation, ConversationContent } from '@/components/ui/shadcn-io/ai/conversation'
import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import { Response } from '@/components/ui/shadcn-io/ai/response'
import { PromptInput, PromptInputTextarea } from '@/components/ui/shadcn-io/ai/prompt-input'
import { Loader } from '@/components/ui/shadcn-io/ai/loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { ConversationSidebar } from '@/components/conversation-sidebar'
import { ChatErrorBoundary } from '@/components/chat-error-boundary'
import { TypingIndicator } from '@/components/typing-indicator'
import { MessageActions } from '@/components/message-actions'
import { MessageTimestamp } from '@/components/message-timestamp'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  const handleNewConversation = useCallback(() => {
    setMessages([])
    setCurrentConversationId(undefined)
  }, [setMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Focus search input in sidebar
        const searchInput = document.querySelector('input[placeholder*="Search conversations"]') as HTMLInputElement
        searchInput?.focus()
      }
      
      // Cmd/Ctrl + N for new conversation
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleNewConversation()
      }
      
      // Cmd/Ctrl + / to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
      
      // Cmd/Ctrl + ? to show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault()
        // This will be handled by KeyboardShortcuts component
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleNewConversation])

  // Auto-close sidebar on mobile when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    // Set initial state based on screen size
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load conversation when conversation ID changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId)
    }
  }, [currentConversationId, loadConversation])


  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId)
  }

  const handleMessageEdit = (messageId: string, newContent: string) => {
    // Update the message in the current conversation
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, content: newContent } : msg
    ))
    
    // TODO: Update in database
    console.log('Message edited:', messageId, newContent)
  }

  const handleSearch = (query: string) => {
    // TODO: Implement search highlighting
    console.log('Searching for:', query)
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
      <KeyboardShortcuts />
      <div className="flex h-screen">
      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {/* Mobile overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="w-80 border-r relative z-50 md:relative md:z-auto">
            <ConversationSidebar
              currentConversationId={currentConversationId}
              onConversationSelect={(id) => {
                handleConversationSelect(id)
                // Auto-close on mobile after selection
                if (window.innerWidth < 768) {
                  setSidebarOpen(false)
                }
              }}
              onNewConversation={() => {
                handleNewConversation()
                // Auto-close on mobile after new conversation
                if (window.innerWidth < 768) {
                  setSidebarOpen(false)
                }
              }}
              onSearch={handleSearch}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}
      
      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col p-4 md:p-6 min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden md:flex"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </Button>
                  <div>
                    <CardTitle className="text-lg">Hindu Philosophy Assistant</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ask questions about Hindu philosophy, festivals, scriptures, and traditions
                    </p>
                  </div>
                </div>
                {usageStats && (
                  <div className="flex gap-2 flex-wrap">
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
            <CardContent className="flex-1 flex flex-col min-h-0 p-4 md:p-6">
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <Conversation className="flex-1 min-h-0">
                  <ConversationContent className="flex-1 min-h-0 overflow-y-auto">
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
                    {messages.map((message) => {
                      const messageContent = message.parts
                        .filter(part => part.type === 'text' && 'text' in part)
                        .map(part => (part as { text: string }).text)
                        .join('')

                      return (
                        <div key={message.id} className="w-full max-w-4xl mx-auto px-2 md:px-4">
                          <div className={`flex w-full items-end gap-2 py-4 ${message.role === 'user' ? 'justify-end' : 'flex-row-reverse justify-end'}`}>
                            <div className="max-w-[80%]">
                              <Message from={message.role}>
                                <MessageContent>
                                  {message.parts.map((part, index) => {
                                    if (part.type === 'text') {
                                      return <Response key={index}>{part.text}</Response>
                                    }
                                    return null
                                  })}
                                </MessageContent>
                              </Message>
                              <div className="mt-3 space-y-3">
                                <div className={`flex items-center ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <MessageTimestamp timestamp={new Date()} />
                                </div>
                                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <MessageActions
                                    messageId={message.id}
                                    content={messageContent}
                                    role={message.role as 'user' | 'assistant'}
                                    onEdit={message.role === 'user' ? handleMessageEdit : undefined}
                                    onRegenerate={message.role === 'assistant' ? () => {
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
                                    } : undefined}
                                    onSearch={handleSearch}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <TypingIndicator isTyping={status === 'streaming'} />
                    <div ref={messagesEndRef} />
                  </ConversationContent>
                </Conversation>
              </div>
              <div className="mt-4 flex-shrink-0 w-full">
                <PromptInput onSubmit={handleSubmit} className="w-full">
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
                    className="w-full resize-none"
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
