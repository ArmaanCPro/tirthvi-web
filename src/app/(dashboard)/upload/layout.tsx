import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'

// This layout uses headers() for auth, so it must be dynamic
export const dynamic = 'force-dynamic'

export default async function UploadLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  // Require auth
  if (!user?.id) {
    redirect('/auth/signin')
  }

  // Require admin - this is the critical security check
  const admin = await isAdmin(user.id)
  if (!admin) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
