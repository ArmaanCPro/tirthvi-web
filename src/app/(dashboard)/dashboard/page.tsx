import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SavedEventsList } from '@/components/saved-events-list'
import { SubscribedEventsList } from '@/components/subscribed-events-list'
import { DashboardStats } from '@/components/dashboard-stats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your saved events, subscriptions, and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick Stats */}
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>

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
