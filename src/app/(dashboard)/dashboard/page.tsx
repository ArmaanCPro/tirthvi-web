import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { SavedEventsList } from '@/components/saved-events-list'
import { SubscribedEventsList } from '@/components/subscribed-events-list'
import { DashboardStats } from '@/components/dashboard-stats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Upload } from 'lucide-react'
import Link from 'next/link'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user?.id) {
    redirect('/')
  }

  const admin = await isAdmin(user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your saved events, subscriptions, and preferences
            </p>
          </div>
          {admin && (
            <Button asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Quick Stats */}
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        {/* AI Chat Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Wisdom Assistant
            </CardTitle>
            <CardDescription>
              Get answers about Hindu philosophy, festivals, and traditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/chat">
                <Bot className="mr-2 h-4 w-4" />
                Start Chatting
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Saved Events */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Events</CardTitle>
            <CardDescription>
              Events you&apos;ve saved for later reference
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <Suspense fallback={<SavedEventsSkeleton />}>
              <SavedEventsList />
            </Suspense>
          </CardContent>
        </Card>

        {/* Subscribed Events */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribed Events</CardTitle>
            <CardDescription>
              Events you&apos;re following for notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <Suspense fallback={<SubscribedEventsSkeleton />}>
              <SubscribedEventsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardStatsSkeleton() {
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

function SavedEventsSkeleton() {
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

function SubscribedEventsSkeleton() {
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
