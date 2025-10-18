'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface SubscribeEventButtonProps {
  eventSlug: string
  className?: string
}

export function SubscribeEventButton({ eventSlug, className }: SubscribeEventButtonProps) {
  const { user } = useAuth()
  const isSignedIn = !!user
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)

  const checkIfSubscribed = useCallback(async () => {
    try {
      const response = await fetch('/api/event-subscriptions')
      const data = await response.json()
      const subscription = data.subscriptions?.find(
        (sub: { eventSlug: string }) => sub.eventSlug === eventSlug
      )
      setIsSubscribed(!!subscription)
      setSubscriptionId(subscription?.id || null)
    } catch (error) {
      console.error('Error checking subscription status:', error)
    } finally {
      setChecking(false)
    }
  }, [eventSlug])

  useEffect(() => {
    if (isSignedIn) {
      checkIfSubscribed()
    } else {
      setChecking(false)
    }
  }, [isSignedIn, checkIfSubscribed])

  async function toggleSubscription() {
    if (!isSignedIn) {
      return
    }

    setLoading(true)
    try {
      if (isSubscribed) {
        // Unsubscribe
        if (subscriptionId) {
          const response = await fetch(`/api/event-subscriptions/${subscriptionId}`, {
            method: 'DELETE',
          })
          
          if (response.ok) {
            setIsSubscribed(false)
            setSubscriptionId(null)
            toast.success('Unsubscribed from event notifications')
          } else {
            toast.error('Failed to unsubscribe')
          }
        }
      } else {
        // Subscribe
        const response = await fetch('/api/event-subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventSlug }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setIsSubscribed(true)
          setSubscriptionId(data.subscription.id)
          toast.success('Subscribed to event notifications!')
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to subscribe')
        }
      }
    } catch (error) {
      console.error('Error toggling subscription:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isSignedIn) {
    return (
      <Button variant="outline" className={className} disabled>
        <Bell className="h-4 w-4 mr-2" />
        Sign in to subscribe
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
      variant={isSubscribed ? "default" : "outline"}
      onClick={toggleSubscription}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isSubscribed ? (
        <BellOff className="h-4 w-4 mr-2" />
      ) : (
        <Bell className="h-4 w-4 mr-2" />
      )}
      {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
    </Button>
  )
}
