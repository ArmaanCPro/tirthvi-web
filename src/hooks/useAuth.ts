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

  useEffect(() => {
    // Fetch session from Better Auth client
    authClient.getSession()
      .then(session => {
        if (session?.user) {
          // Check admin status
          fetch('/api/auth/admin')
            .then(res => res.json())
            .then(data => {
              // Check premium status
              return fetch('/api/auth/premium')
                .then(res => res.json())
                .then(premiumData => ({
                  isAdmin: data?.isAdmin || false,
                  isPremium: premiumData?.isPremium || false,
                }))
            })
            .then(({ isAdmin, isPremium }) => {
              setAuthState({
                isSignedIn: true,
                user: {
                  id: session.user.id || '',
                  email: session.user.email || '',
                  name: session.user.name || undefined,
                  image: session.user.image || undefined,
                },
                isLoading: false,
                isAdmin,
                isPremium,
              })
            })
            .catch(() => {
              setAuthState({
                isSignedIn: true,
                user: {
                  id: session.user.id || '',
                  email: session.user.email || '',
                  name: session.user.name || undefined,
                  image: session.user.image || undefined,
                },
                isLoading: false,
                isAdmin: false,
                isPremium: false,
              })
            })
        } else {
          setAuthState({
            isSignedIn: false,
            user: null,
            isLoading: false,
            isAdmin: false,
            isPremium: false,
          })
        }
      })
      .catch(() => {
        setAuthState({
          isSignedIn: false,
          user: null,
          isLoading: false,
          isAdmin: false,
          isPremium: false,
        })
      })
  }, [])

  return authState
}
