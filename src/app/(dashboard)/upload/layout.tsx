import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, isAdmin } from '@/lib/auth'

export default async function UploadLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  // Require auth
  if (!user?.id) {
    redirect('/')
  }

  // Require admin
  const admin = await isAdmin(user.id)
  if (!admin) {
    redirect('/')
  }

  return <>{children}</>
}
