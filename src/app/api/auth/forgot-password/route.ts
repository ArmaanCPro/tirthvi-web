import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import { Resend } from 'resend'
import crypto from 'crypto'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.email, email)
    })

    if (!user) {
      // Don't reveal if email exists - return success anyway
      return NextResponse.json({ success: true })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour

    // Update user with reset token
    await db.update(profiles)
      .set({
        resetToken,
        resetTokenExpires: resetExpires,
      })
      .where(eq(profiles.id, user.id))

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    await resend.emails.send({
      from: 'noreply@tirthvi.com',
      to: email,
      subject: 'Reset your password',
      html: `
        <h2>Reset your password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
