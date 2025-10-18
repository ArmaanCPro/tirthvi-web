import { NextResponse } from "next/server"

export async function GET() {
  const debugInfo = {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "✅ Set" : "❌ Missing",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "❌ Missing",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "❌ Missing",
  }

  return NextResponse.json(debugInfo)
}
