import { NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { getAllEvents } from '@/lib/events'
import { sql } from 'drizzle-orm'

// This endpoint populates the events_cache table for the Edge Function
// Only accessible from Supabase Edge Functions (no public access)
export async function POST() {
  try {
    console.log('Populating events cache for Edge Function...')
    
    // Get all events from your JSON files
    const events = await getAllEvents()
    
    // Clear existing cache
    await db.execute('DELETE FROM public.events_cache')
    
    // Insert events into cache
    for (const event of events) {
      await db.execute(sql`
        INSERT INTO public.events_cache (slug, name, description, occurrences, updated_at)
        VALUES (${event.slug}, ${event.name}, ${event.description}, ${JSON.stringify(event.occurrences)}, NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          occurrences = EXCLUDED.occurrences,
          updated_at = NOW()
      `)
    }

    console.log(`Populated events cache with ${events.length} events`)

    return NextResponse.json({
      success: true,
      message: `Populated events cache with ${events.length} events`,
      events_count: events.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error populating events cache:', error)
    return NextResponse.json({ 
      error: 'Failed to populate events cache', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
