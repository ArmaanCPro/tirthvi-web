"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"

interface SignedInProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SignedIn({ children, fallback = null }: SignedInProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return null // or a loading spinner
  }

  if (session?.user) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
