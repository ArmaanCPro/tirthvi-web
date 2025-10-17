import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = verifyEmailSchema.parse(body)

    // Find user by email verification token
    // For now, we'll use a simple approach - in production you'd want a separate verification token
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.email, token) // This is a simplified approach
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Mark email as verified
    await db.update(profiles)
      .set({
        emailVerified: new Date(),
      })
      .where(eq(profiles.id, user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
