'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Keyboard, X } from 'lucide-react'

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + ? to toggle shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>New conversation</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘N</kbd>
            </div>
            <div className="flex justify-between">
              <span>Toggle sidebar</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/</kbd>
            </div>
            <div className="flex justify-between">
              <span>Search conversations</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
            </div>
            <div className="flex justify-between">
              <span>Send message</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
            </div>
            <div className="flex justify-between">
              <span>New line</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift+Enter</kbd>
            </div>
            <div className="flex justify-between">
              <span>Show shortcuts</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘?</kbd>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
