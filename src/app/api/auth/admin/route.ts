import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      // Not signed in -> not admin
      return NextResponse.json({ isAdmin: false })
    }

    const admin = await isAdmin(userId)
    return NextResponse.json({ isAdmin: admin })
  } catch (error) {
    // On any error, default to not admin
    return NextResponse.json({ isAdmin: false })
  }
}
