'use client'

import { useState, useEffect } from 'react'
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
  const { messages, sendMessage, status } = useChat({
    onError: (error) => {
      if (error.message.includes('429')) {
        // Rate limit reached
        setUsageStats(prev => prev ? { ...prev, isLimitReached: true } : null)
      }
      console.error('Chat error:', error)
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
    if (input.trim()) {
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: input }]
      })
      setInput('')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hindu Philosophy Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ask questions about Hindu philosophy, festivals, scriptures, and traditions
              </p>
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
                </Message>
              ))}
              {status === 'streaming' && (
                <Message from="assistant">
                  <MessageContent>
                    <Loader />
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
          </Conversation>
          <div className="mt-4">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  usageStats?.isLimitReached 
                    ? "Daily limit reached. Try again tomorrow." 
                    : "Ask about Hindu philosophy, festivals, or traditions..."
                }
                disabled={status === 'streaming' || usageStats?.isLimitReached}
              />
            </PromptInput>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
