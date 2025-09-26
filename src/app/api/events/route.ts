import { getAllEvents } from '@/lib/events';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json({ events, count: events.length });
  } catch (error) {
    console.error('API Error - getAllEvents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' }, 
      { status: 500 }
    );
  }
}
