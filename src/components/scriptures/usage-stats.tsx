// displays usage stats for scriptures

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Crown, Download } from 'lucide-react'

export function UsageStats() {
    const { user } = useUser()
    const [stats, setStats] = useState<{
        remaining: number
        limit: number
        isPremium: boolean
    } | null>(null)

    useEffect(() => {
        if (!user) return

        // Fetch usage stats
        fetch('/api/scriptures/usage')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(error => console.error('Error fetching usage stats:', error))
    }, [user])

    if (!stats) return null

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Scripture Download Usage
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {stats.isPremium ? (
                    <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">Unlimited Downloads</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            Premium
                        </Badge>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Downloads this month</span>
                                <span>{stats.limit - stats.remaining} / {stats.limit}</span>
                            </div>
                            <Progress
                                value={(stats.limit - stats.remaining) / stats.limit * 100}
                                className="h-2"
                            />
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                            {stats.remaining} downloads remaining this month
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
