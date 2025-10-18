"use client"

import { useState, useEffect } from "react"
import { ReactNode } from "react"
import { authClient } from "@/lib/auth-client"

interface SignedInProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SignedIn({ children, fallback = null }: SignedInProps) {
  const [session, setSession] = useState<{ user?: { id: string } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Use Better Auth client for session
    authClient.getSession()
      .then((response) => {
        // Better Auth returns a Data wrapper with user property
        if (response && 'data' in response && response.data && response.data.user) {
          setSession({ user: { id: response.data.user.id } })
        } else {
          setSession(null)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setSession(null)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return null // or a loading spinner
  }

  if (session?.user) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
