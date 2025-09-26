import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, path: pathToRevalidate, secret } = body;

    // Verify the secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ 
        message: `Revalidated tag: ${tag}`,
        timestamp: new Date().toISOString()
      });
    }

    // Revalidate by path
    if (pathToRevalidate) {
      revalidatePath(pathToRevalidate);
      return NextResponse.json({ 
        message: `Revalidated path: ${pathToRevalidate}`,
        timestamp: new Date().toISOString()
      });
    }

    // Revalidate all events if no specific tag/path provided
    revalidateTag('events');
    revalidateTag('event-detail');
    revalidateTag('calendar-events');
    revalidateTag('events-by-year');

    return NextResponse.json({ 
      message: 'Revalidated all event caches',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate cache' }, 
      { status: 500 }
    );
  }
}
