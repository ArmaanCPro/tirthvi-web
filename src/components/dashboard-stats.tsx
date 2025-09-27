'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bookmark, Bell, MessageSquare } from 'lucide-react'

interface DashboardStats {
  savedEvents: number
  subscribedEvents: number
  chatSessions: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [savedRes, subscribedRes, chatRes] = await Promise.all([
          fetch('/api/saved-events'),
          fetch('/api/event-subscriptions'),
          fetch('/api/chat/conversations'),
        ])

        const savedData = await savedRes.json()
        const subscribedData = await subscribedRes.json()
        const chatData = await chatRes.json()

        setStats({
          savedEvents: savedData.savedEvents?.length || 0,
          subscribedEvents: subscribedData.subscriptions?.length || 0,
          chatSessions: chatData.conversations?.length || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saved Events</CardTitle>
          <Bookmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.savedEvents || 0}</div>
          <p className="text-xs text-muted-foreground">
            Events saved for later
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscribed Events</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.subscribedEvents || 0}</div>
          <p className="text-xs text-muted-foreground">
            Events you&apos;re following
          </p>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.chatSessions || 0}</div>
          <p className="text-xs text-muted-foreground">
            AI conversations
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
