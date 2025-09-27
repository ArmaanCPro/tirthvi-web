'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Bookmark, Calendar, MapPin, ExternalLink, Trash2, Edit3 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface SavedEvent {
  id: string
  eventSlug: string
  notes?: string
  savedAt: string
  event: {
    title: string
    description: string
    date: string
    location?: string
    image?: string
  } | null
}

export function SavedEventsList() {
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    fetchSavedEvents()
  }, [])

  async function fetchSavedEvents() {
    try {
      const response = await fetch('/api/saved-events')
      const data = await response.json()
      setSavedEvents(data.savedEvents || [])
    } catch (error) {
      console.error('Error fetching saved events:', error)
    } finally {
      setLoading(false)
    }
  }

  async function removeSavedEvent(id: string) {
    try {
      const response = await fetch(`/api/saved-events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedEvents(prev => prev.filter(event => event.id !== id))
        toast.success('Event removed from saved list')
      } else {
        toast.error('Failed to remove event')
      }
    } catch (error) {
      console.error('Error removing saved event:', error)
    }
  }

  async function updateNotes(id: string, notes: string) {
    try {
      const response = await fetch(`/api/saved-events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        setSavedEvents(prev => 
          prev.map(event => 
            event.id === id ? { ...event, notes } : event
          )
        )
        setEditingId(null)
        setEditNotes('')
        toast.success('Notes updated successfully')
      } else {
        toast.error('Failed to update notes')
      }
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="h-12 w-12 bg-muted animate-pulse rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (savedEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No saved events yet</h3>
        <p className="text-muted-foreground mb-4">
          Start exploring events and save the ones you&apos;re interested in
        </p>
        <Button asChild>
          <Link href="/calendar">Browse Events</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {savedEvents.map((savedEvent) => (
        <Card key={savedEvent.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              {/* Event Image */}
              <div className="w-24 h-24 bg-muted flex-shrink-0">
                {savedEvent.event?.image ? (
                  <Image
                    src={savedEvent.event.image}
                    alt={savedEvent.event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {savedEvent.event?.title || 'Event not found'}
                    </h3>
                    
                    {savedEvent.event && (
                      <div className="space-y-1 text-sm text-muted-foreground mb-2">
                        {savedEvent.event.date && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(new Date(savedEvent.event.date), 'MMM dd, yyyy')}
                          </div>
                        )}
                        {savedEvent.event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {savedEvent.event.location}
                          </div>
                        )}
                      </div>
                    )}

                    {savedEvent.notes && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Notes:</strong> {savedEvent.notes}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Saved on {format(new Date(savedEvent.savedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {savedEvent.event && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/events/${savedEvent.eventSlug}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(savedEvent.id)
                        setEditNotes(savedEvent.notes || '')
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Saved Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this event from your saved list? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeSavedEvent(savedEvent.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Edit Notes Form */}
                {editingId === savedEvent.id && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes about this event..."
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null)
                          setEditNotes('')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateNotes(savedEvent.id, editNotes)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
