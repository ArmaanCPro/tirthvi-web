"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"

interface AuthState {
  isSignedIn: boolean
  user: {
    id: string
    email: string
    name?: string
    image?: string
  } | null
  isLoading: boolean
  isAdmin: boolean
  isPremium: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isSignedIn: false,
    user: null,
    isLoading: true,
    isAdmin: false,
    isPremium: false,
  })

  // Use Better Auth's reactive useSession hook
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      return
    }

    if (session?.user) {
      // Check admin and premium status only when session changes
      const checkPermissions = async () => {
        try {
          const [adminResponse, premiumResponse] = await Promise.all([
            fetch('/api/auth/admin').then(res => res.json()),
            fetch('/api/auth/premium').then(res => res.json())
          ])
          
          setAuthState({
            isSignedIn: true,
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              image: session.user.image || undefined,
            },
            isLoading: false,
            isAdmin: adminResponse?.isAdmin || false,
            isPremium: premiumResponse?.isPremium || false,
          })
        } catch (error) {
          console.error('Permission check failed:', error)
          setAuthState({
            isSignedIn: true,
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              image: session.user.image || undefined,
            },
            isLoading: false,
            isAdmin: false,
            isPremium: false,
          })
        }
      }

      checkPermissions()
    } else {
      setAuthState({
        isSignedIn: false,
        user: null,
        isLoading: false,
        isAdmin: false,
        isPremium: false,
      })
    }
  }, [session, isPending])

  return authState
}
