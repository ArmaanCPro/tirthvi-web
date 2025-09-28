'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Edit3, 
  Copy, 
  RotateCcw, 
  Check, 
  X,
  Search
} from 'lucide-react'
import { Actions } from '@/components/ui/shadcn-io/ai/actions'

interface MessageActionsProps {
  messageId: string
  content: string
  role: 'user' | 'assistant'
  onEdit?: (messageId: string, newContent: string) => void
  onRegenerate?: () => void
  onCopy?: (content: string) => void
  onSearch?: (query: string) => void
}

export function MessageActions({ 
  messageId, 
  content, 
  role, 
  onEdit, 
  onRegenerate, 
  onCopy,
  onSearch 
}: MessageActionsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [searchQuery, setSearchQuery] = useState('')

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(messageId, editContent)
      setIsEditing(false)
    } else {
      setEditContent(content)
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(content)
    setIsEditing(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    onCopy?.(content)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Input
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleEdit}>
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Actions>
      {role === 'user' && onEdit && (
        <button
          onClick={handleEdit}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Edit3 className="h-3 w-3" />
          Edit
        </button>
      )}
      
      {role === 'assistant' && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Regenerate
        </button>
      )}
      
      <button
        onClick={handleCopy}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <Copy className="h-3 w-3" />
        Copy
      </button>
      
      {onSearch && (
        <div className="flex items-center gap-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in conversation..."
            className="h-6 text-xs w-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSearch}
            className="h-6 w-6 p-0"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>
      )}
    </Actions>
  )
}
