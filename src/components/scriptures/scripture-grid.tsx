'use client'

import { Scripture } from '@/lib/schemas/scripture'
import { ScriptureCard } from './scripture-card'

interface ScriptureGridProps {
  scriptures: Scripture[]
}

export function ScriptureGrid({ scriptures }: ScriptureGridProps) {
  if (scriptures.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-muted-foreground">
          No scriptures found
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Check back later for new additions to our collection.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {scriptures.map((scripture) => (
        <ScriptureCard key={scripture.id} scripture={scripture} />
      ))}
    </div>
  )
}
