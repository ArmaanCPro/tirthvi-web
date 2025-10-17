'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { SignInButton } from '@/components/auth'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
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

// Type guard for text parts in UIMessage.parts
function isTextPart(part: unknown): part is { type: 'text'; text: string } {
  if (typeof part !== 'object' || part === null) return false
  const obj = part as Record<string, unknown>
  return obj.type === 'text' && typeof obj.text === 'string'
}

type UIMessageWithContent = UIMessage & {
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
};

function extractMessageText(message: UIMessage): string {
  const m = message as UIMessageWithContent;
  if (typeof m.content === 'string' && m.content.length > 0) {
    return m.content;
  }
  if (Array.isArray(m.parts)) {
    return m.parts.filter(isTextPart).map((p) => p.text).join('');
  }
  return '';
}

export default function ChatPage() {
  const { data: session, status: authStatus } = useSession()
  const isLoaded = authStatus !== "loading"
  const isSignedIn = !!session?.user
  const [input, setInput] = useState('')
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({ conversationId: currentConversationId }),
      fetch: async (input, init) => {
        const res = await fetch(input as RequestInfo, init as RequestInit)
        const cid = res.headers.get('x-conversation-id') || undefined
        if (cid && cid !== currentConversationId) {
          setCurrentConversationId(cid)
        }
        return res
      },
    }),
    onData: (data) => {
      // Optional: future compatibility if server sends data parts
      if (data && typeof data === 'object' && 'conversationId' in data) {
        const cid = (data as { conversationId?: string }).conversationId
        if (cid && cid !== currentConversationId) {
          setCurrentConversationId(cid)
        }
      }
    },
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

  // Load conversation when conversation ID changes, but avoid overwriting active streaming state
  useEffect(() => {
    if (currentConversationId && messages.length === 0) {
      loadConversation(currentConversationId)
    }
  }, [currentConversationId, loadConversation, messages.length])


  const handleConversationSelect = (conversationId: string) => {
    setMessages([])
    setCurrentConversationId(conversationId)
    // Proactively load messages for the selected conversation
    loadConversation(conversationId)
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
      const content = extractMessageText(lastUserMessage as UIMessage)
      if (content) {
        sendMessage({
          text: content
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
            <CardTitle className="text-2xl">Hindu Philosophy Assistant</CardTitle>
            <p className="text-base text-muted-foreground">
              Sign in to access the AI assistant
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-medium mb-2">Authentication Required</h3>
              <p className="text-base text-muted-foreground mb-4">
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
        text: input
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
      <div className="flex h-screen text-lg md:text-xl">
      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {/* Mobile overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 border-r bg-background shadow-lg z-50 md:relative md:inset-auto md:shadow-none md:z-auto">
            <ConversationSidebar
              key={currentConversationId || 'sidebar'}
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
        <div className="flex-1 flex flex-col p-0 md:p-6 min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden md:flex"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    History
                  </Button>
                  <div>
                    <CardTitle className="text-2xl">Hindu Philosophy Assistant</CardTitle>
                    <p className="text-base text-muted-foreground">
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
            <CardContent className="flex-1 flex flex-col min-h-0 p-0 md:p-6">
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <Conversation className="flex-1 min-h-0">
                  <ConversationContent className="flex-1 min-h-0 overflow-y-auto">
                    {messages.length === 0 && (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <h3 className="text-2xl font-medium mb-2">Welcome to the Hindu Philosophy Assistant</h3>
                          <p className="text-base">Ask me anything about Hindu philosophy, festivals, or traditions.</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Error Display */}
                    {error && (
                      <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-base text-destructive">
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
                      const messageContent = extractMessageText(message as UIMessage)

                      return (
                        <div key={message.id} className="w-full max-w-none md:max-w-7xl mx-auto px-0 md:px-4">
                          <div className={`flex w-full items-end gap-2 py-4 ${message.role === 'user' ? 'justify-end' : 'flex-row-reverse justify-end'}`}>
                            <div className="w-full md:max-w-[95%] xl:max-w-[90%]">
                              <Message from={message.role}>
                                <MessageContent>
                                  <div className="chat-content text-lg leading-relaxed md:text-xl md:leading-relaxed">
                                    <Response parseIncompleteMarkdown>
                                      {extractMessageText(message as UIMessage)}
                                    </Response>
                                  </div>
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
                                        const content = extractMessageText(lastUserMessage as UIMessage)
                                        if (content) {
                                          sendMessage({
                                            text: content
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
                    className="w-full resize-none text-base md:text-lg leading-relaxed"
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
