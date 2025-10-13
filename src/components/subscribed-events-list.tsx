'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import {Bell, Calendar, ExternalLink, Trash2} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { getNextOccurrence, formatEventDate } from '@/lib/event-utils'

interface SubscribedEvent {
  id: string
  eventSlug: string
  notificationEnabled: boolean
  subscribedAt: string
  event: {
    name: string
    description: string
    slug: string
    category?: string
    image: {
      url: string
      alt: string
    }
    occurrences: Record<string, Array<{
      date: string
      startTime?: string
      endTime?: string
      timezone: string
      significance?: string
    }>>
  } | null
}

export function SubscribedEventsList() {
  const [subscribedEvents, setSubscribedEvents] = useState<SubscribedEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscribedEvents()
  }, [])

  async function fetchSubscribedEvents() {
    try {
      const response = await fetch('/api/event-subscriptions')
      const data = await response.json()
      setSubscribedEvents(data.subscriptions || [])
    } catch (error) {
      console.error('Error fetching subscribed events:', error)
    } finally {
      setLoading(false)
    }
  }

  async function removeSubscription(id: string) {
    try {
      const response = await fetch(`/api/event-subscriptions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSubscribedEvents(prev => prev.filter(event => event.id !== id))
        toast.success('Unsubscribed from event')
      } else {
        toast.error('Failed to unsubscribe')
      }
    } catch (error) {
      console.error('Error removing subscription:', error)
    }
  }

  async function toggleNotifications(id: string, enabled: boolean) {
    try {
      const response = await fetch(`/api/event-subscriptions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationEnabled: enabled }),
      })

      if (response.ok) {
        setSubscribedEvents(prev => 
          prev.map(event => 
            event.id === id ? { ...event, notificationEnabled: enabled } : event
          )
        )
        toast.success(enabled ? 'Notifications enabled' : 'Notifications disabled')
      } else {
        toast.error('Failed to update notifications')
      }
    } catch (error) {
      console.error('Error updating notifications:', error)
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

  if (subscribedEvents.length === 0) {
    return (
        <div className="text-center py-8">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant={"icon"}>
                        <Bell />
                    </EmptyMedia>
                    <EmptyTitle>No subscribed events yet</EmptyTitle>
                    <EmptyDescription>
                        Subscribe to events to get notifications about upcoming celebrations
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                    <Button asChild>
                        <Link href="/calendar">Browse Events</Link>
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {subscribedEvents.map((subscribedEvent) => (
        <Card key={subscribedEvent.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Event Image */}
              <div className="w-full h-32 sm:w-24 sm:h-24 bg-muted flex-shrink-0 relative">
                {subscribedEvent.event?.image ? (
                  <Image
                    src={subscribedEvent.event.image.url}
                    alt={subscribedEvent.event.image.alt}
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    {subscribedEvent.event ? (
                      <Link 
                        href={`/events/${subscribedEvent.eventSlug}`}
                        className="font-semibold text-lg mb-1 hover:text-primary transition-colors cursor-pointer block"
                      >
                        {subscribedEvent.event.name}
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-lg mb-1 text-muted-foreground">
                        Event not found
                      </h3>
                    )}
                    
                    {subscribedEvent.event && (
                      <div className="space-y-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium">Next occurrence:</span>
                          <span className="ml-1">
                            {(() => {
                              const nextOccurrence = getNextOccurrence(subscribedEvent.event!)
                              if (nextOccurrence) {
                                return formatEventDate(nextOccurrence.date)
                              }
                              return 'Date TBD'
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Category:</span>
                          <span className="ml-1 capitalize">{subscribedEvent.event.category || 'Religious'}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Subscribed on {format(new Date(subscribedEvent.subscribedAt), 'MMM dd, yyyy')}</span>
                      {subscribedEvent.event && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {subscribedEvent.event.category || 'Religious'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 sm:ml-4">
                    {subscribedEvent.event && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/events/${subscribedEvent.eventSlug}`}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={subscribedEvent.notificationEnabled}
                        onCheckedChange={(enabled) => toggleNotifications(subscribedEvent.id, enabled)}
                      />
                      <span className="text-sm text-muted-foreground">
                        Notifications
                      </span>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Unsubscribe from Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to unsubscribe from this event? You will no longer receive notifications about it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeSubscription(subscribedEvent.id)}>
                            Unsubscribe
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
