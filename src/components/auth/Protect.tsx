"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"

interface ProtectProps {
  children: ReactNode
  fallback?: ReactNode
  plan?: string // For future use with subscription plans
}

export function Protect({ children, fallback = null }: ProtectProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return null // or a loading spinner
  }

  if (!session?.user) {
    return <>{fallback}</>
  }

  // TODO: Add plan-based protection logic here
  // For now, just check if user is authenticated
  return <>{children}</>
}