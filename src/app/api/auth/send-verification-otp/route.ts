import { auth } from "@/lib/auth-config"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type } = body

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      )
    }

    // Use Better Auth server-side API
    const result = await auth.api.sendVerificationOTP({
      body: { email, type }
    })

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send verification code" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Send verification OTP error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
