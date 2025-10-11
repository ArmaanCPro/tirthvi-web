import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isPremium } from '@/lib/premium'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      // Not signed in -> not premium
      return NextResponse.json({ isPremium: false })
    }

    const premium = await isPremium(userId)
    return NextResponse.json({ isPremium: premium })
  } catch {
    // On any error, default to not premium
    return NextResponse.json({ isPremium: false })
  }
}
