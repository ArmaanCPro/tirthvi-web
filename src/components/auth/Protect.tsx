"use client"

import { ReactNode, useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

interface ProtectProps {
  children: ReactNode
  fallback?: ReactNode
  plan?: string // For subscription plan protection
}

export function Protect({ children, fallback = null, plan }: ProtectProps) {
  const [isPremium, setIsPremium] = useState(false)
  
  // Use Better Auth's reactive useSession hook
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (session?.user && plan) {
      // Check premium status for plan-based protection
      fetch('/api/auth/premium')
        .then(res => res.json())
        .then(premiumData => {
          setIsPremium(!!premiumData?.isPremium)
        })
        .catch(() => {
          setIsPremium(false)
        })
    } else {
      setIsPremium(false)
    }
  }, [session, plan])

  if (isPending) {
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