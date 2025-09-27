'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

interface SaveEventButtonProps {
  eventSlug: string
  className?: string
}

export function SaveEventButton({ eventSlug, className }: SaveEventButtonProps) {
  const { isSignedIn } = useUser()
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  const checkIfSaved = useCallback(async () => {
    try {
      const response = await fetch('/api/saved-events')
      const data = await response.json()
      const isEventSaved = data.savedEvents?.some(
        (event: { eventSlug: string }) => event.eventSlug === eventSlug
      )
      setIsSaved(isEventSaved)
    } catch (error) {
      console.error('Error checking saved status:', error)
    } finally {
      setChecking(false)
    }
  }, [eventSlug])

  useEffect(() => {
    if (isSignedIn) {
      checkIfSaved()
    } else {
      setChecking(false)
    }
  }, [isSignedIn, checkIfSaved])

  async function toggleSave() {
    if (!isSignedIn) {
      // Redirect to sign in or show modal
      return
    }

    setLoading(true)
    try {
      if (isSaved) {
        // Find the saved event ID and remove it
        const response = await fetch('/api/saved-events')
        const data = await response.json()
        const savedEvent = data.savedEvents?.find(
          (event: { eventSlug: string }) => event.eventSlug === eventSlug
        )
        
        if (savedEvent) {
          const response = await fetch(`/api/saved-events/${savedEvent.id}`, {
            method: 'DELETE',
          })
          
          if (response.ok) {
            setIsSaved(false)
            toast.success('Event removed from saved list')
            // Refresh the saved status to ensure consistency
            await checkIfSaved()
          } else {
            toast.error('Failed to remove event')
          }
        }
      } else {
        const response = await fetch('/api/saved-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventSlug }),
        })
        
        if (response.ok) {
          setIsSaved(true)
          toast.success('Event saved successfully!')
          // Refresh the saved status to ensure consistency
          await checkIfSaved()
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to save event')
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isSignedIn) {
    return (
      <Button variant="outline" className={className} disabled>
        <Bookmark className="h-4 w-4 mr-2" />
        Sign in to save
      </Button>
    )
  }

  if (checking) {
    return (
      <Button variant="outline" className={className} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking...
      </Button>
    )
  }

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      onClick={toggleSave}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {isSaved ? 'Saved' : 'Save Event'}
    </Button>
  )
}
