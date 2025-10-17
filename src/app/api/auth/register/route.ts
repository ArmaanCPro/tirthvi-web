import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.query.profiles.findFirst({
      where: eq(profiles.email, email)
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const [user] = await db.insert(profiles).values({
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerified: null, // Will be verified via email
    }).returning()

    return NextResponse.json({
      success: true,
      message: 'User registered successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
