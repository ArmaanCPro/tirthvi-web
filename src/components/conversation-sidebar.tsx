'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Conversation {
  id: string
  title?: string
  messages: Array<{
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    createdAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}

interface ConversationSidebarProps {
  currentConversationId?: string
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
}

export function ConversationSidebar({ 
  currentConversationId, 
  onConversationSelect, 
  onNewConversation 
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // Fetch conversations
  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations?id=${conversationId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        // If we deleted the current conversation, create a new one
        if (conversationId === currentConversationId) {
          onNewConversation()
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const handleEditTitle = (conversation: Conversation) => {
    setEditingId(conversation.id)
    setEditTitle(conversation.title || '')
  }

  const handleSaveTitle = async (conversationId: string) => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: conversationId,
          title: editTitle,
        }),
      })

      if (response.ok) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, title: editTitle }
              : conv
          )
        )
        setEditingId(null)
        setEditTitle('')
      }
    } catch (error) {
      console.error('Error updating conversation title:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(date).toLocaleDateString()
  }

  const getConversationPreview = (conversation: Conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    if (!lastMessage) return 'No messages yet'
    
    const content = lastMessage.content
    return content.length > 50 ? content.substring(0, 50) + '...' : content
  }

  if (loading) {
    return (
      <Card className="w-80 h-full">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <Button
            size="sm"
            onClick={onNewConversation}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg border cursor-pointer transition-colors ${
                  currentConversationId === conversation.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-6 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveTitle(conversation.id)
                            } else if (e.key === 'Escape') {
                              handleCancelEdit()
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSaveTitle(conversation.id)
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelEdit()
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium text-sm truncate">
                          {conversation.title || 'New Conversation'}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {getConversationPreview(conversation)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {conversation.messages.length} messages
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(conversation.updatedAt)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {editingId !== conversation.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTitle(conversation)
                          }}
                        >
                          <Edit3 className="h-3 w-3 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteConversation(conversation.id)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
