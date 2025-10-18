import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth-config'
import { headers } from 'next/headers'

export default async function UploadLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Require auth
  if (!session) {
    redirect('/auth/signin')
  }

  // Require admin - this is the critical security check
  const adminResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/admin`, {
    headers: {
      cookie: (await headers()).get('cookie') || ''
    }
  })
  const adminData = await adminResponse.json()
  const admin = adminData?.isAdmin || false
  
  if (!admin) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
