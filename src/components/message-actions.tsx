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
// import { Actions } from '@/components/ui/shadcn-io/ai/actions'

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
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-3">
        {role === 'user' && onEdit && (
          <button
            onClick={handleEdit}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
        )}
        
        {role === 'assistant' && onRegenerate && (
          <button
            onClick={onRegenerate}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Regenerate
          </button>
        )}
        
        <button
          onClick={handleCopy}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
      </div>
      
      {onSearch && (
        <div className="flex items-center gap-2 w-full">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in conversation..."
            className="h-8 text-xs flex-1 min-w-0"
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
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
