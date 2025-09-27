// Test endpoint for email notifications
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Call your Supabase Edge Function to test email
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const response = await fetch(`${supabaseUrl}/functions/v1/process-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ testEmail: email })
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: 'Failed to send test email', details: error },
        { status: 500 }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      result 
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
