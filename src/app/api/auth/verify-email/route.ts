import { auth } from "@/lib/auth-config"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      )
    }

    // Use Better Auth server-side API
    const result = await auth.api.verifyEmailOTP({
      body: { email, otp }
    })

    if (!result.status) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
