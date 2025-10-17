"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"

interface SignedOutProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SignedOut({ children, fallback = null }: SignedOutProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return null // or a loading spinner
  }

  if (!session?.user) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
