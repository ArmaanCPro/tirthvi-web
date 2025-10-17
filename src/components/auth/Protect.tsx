"use client"

import { useSession } from "next-auth/react"
import { ReactNode, useEffect, useState } from "react"

interface ProtectProps {
  children: ReactNode
  fallback?: ReactNode
  plan?: string // For subscription plan protection
}

export function Protect({ children, fallback = null, plan }: ProtectProps) {
  const { data: session, status } = useSession()
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id && plan) {
      // Check premium status for plan-based protection
      fetch('/api/auth/premium')
        .then(res => res.json())
        .then(data => {
          setIsPremium(!!data?.isPremium)
          setIsLoading(false)
        })
        .catch(() => {
          setIsPremium(false)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [session?.user?.id, plan])

  if (status === "loading" || isLoading) {
    return null
  }

  if (!session?.user) {
    return <>{fallback}</>
  }

  // If plan is specified, check if user has premium access
  if (plan && !isPremium) {
    return <>{fallback}</>
  }

  return <>{children}</>
}