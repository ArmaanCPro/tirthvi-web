import { ReactNode } from 'react'
import { auth } from '@/lib/auth-config'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'

export default async function UploadLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  const userId = session?.user?.id

  // Require auth
  if (!userId) {
    redirect('/')
  }

  // Require admin
  const admin = await isAdmin(userId)
  if (!admin) {
    redirect('/')
  }

  return <>{children}</>
}
