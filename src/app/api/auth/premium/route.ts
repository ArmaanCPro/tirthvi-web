import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { isPremium } from '@/lib/premium'

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      // Not signed in -> not premium
      return NextResponse.json({ isPremium: false })
    }

    const premium = await isPremium(session.user.id)
    return NextResponse.json({ isPremium: premium })
  } catch {
    // On any error, default to not premium
    return NextResponse.json({ isPremium: false })
  }
}
