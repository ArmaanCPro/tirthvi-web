import { ReactNode } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'

export default async function UploadLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()

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
