"use client"

import { useState, useEffect } from "react"
import { ReactNode } from "react"
import { authClient } from "@/lib/auth-client"

interface SignedOutProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SignedOut({ children, fallback = null }: SignedOutProps) {
  const [session, setSession] = useState<{ user?: { id: string } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Use Better Auth client for session
    authClient.getSession()
      .then(data => {
        setSession(data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return null // or a loading spinner
  }

  if (!session?.user) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
