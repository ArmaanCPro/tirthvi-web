import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-config'
import { getSubscriptionStatus } from '@/lib/premium'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const status = await getSubscriptionStatus(session.user.id)
    
    return NextResponse.json(status)
  } catch (error) {
    console.error('Billing status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
