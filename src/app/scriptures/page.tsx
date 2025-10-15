import { Suspense } from 'react'
import { ScriptureGrid } from '@/components/scriptures/scripture-grid'
import { ScriptureCardSkeletonList } from '@/components/scriptures/scripture-card-skeleton'
import { UsageStats } from '@/components/scriptures/usage-stats'
import { getAllScriptures } from '@/lib/scriptures'

export default async function ScripturesPage() {
    const scriptures = await getAllScriptures()

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Scripture Library</h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                    Explore the timeless collection of Hindu scripture with our curated collection of sacred texts.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                <div className="lg:col-span-3">
                    <Suspense fallback={<ScriptureCardSkeletonList count={6} />}>
                        <ScriptureGrid scriptures={scriptures} />
                    </Suspense>
                </div>

                <div className="lg:col-span-1">
                    <UsageStats />
                </div>
            </div>
        </div>
    )
}