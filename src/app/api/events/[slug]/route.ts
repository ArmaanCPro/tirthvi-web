import { getEventBySlug } from '@/lib/events';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    const { slug } = await params;
    console.error(`API Error - getEventBySlug(${slug}):`, error);
    return NextResponse.json(
      { error: 'Failed to fetch event' }, 
      { status: 500 }
    );
  }
}