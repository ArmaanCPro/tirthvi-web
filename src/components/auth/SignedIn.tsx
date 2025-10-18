"use client"

import { useState, useEffect } from "react"
import { ReactNode } from "react"
import { authClient } from "@/lib/auth-client"

interface SignedInProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SignedIn({ children, fallback = null }: SignedInProps) {
  // Use Better Auth's reactive useSession hook
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return null // or a loading spinner
  }

  if (session?.user) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
