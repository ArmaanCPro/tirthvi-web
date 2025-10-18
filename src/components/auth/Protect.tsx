"use client"

import { ReactNode, useEffect, useState } from "react"

interface ProtectProps {
  children: ReactNode
  fallback?: ReactNode
  plan?: string // For subscription plan protection
}

export function Protect({ children, fallback = null, plan }: ProtectProps) {
  const [session, setSession] = useState<{ user?: { id: string } } | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data)
        if (data?.user?.id && plan) {
          // Check premium status for plan-based protection
          return fetch('/api/auth/premium')
            .then(res => res.json())
            .then(premiumData => {
              setIsPremium(!!premiumData?.isPremium)
              setIsLoading(false)
            })
        } else {
          setIsLoading(false)
        }
      })
      .catch(() => {
        setIsPremium(false)
        setIsLoading(false)
      })
  }, [plan])

  if (isLoading) {
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