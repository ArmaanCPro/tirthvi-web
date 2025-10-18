"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

interface AuthContextType {
  user: { id: string; email: string; name?: string; image?: string } | null
  isLoading: boolean
  isAdmin: boolean
  isPremium: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  isPremium: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    isLoading: true,
    isAdmin: false,
    isPremium: false,
  })

  useEffect(() => {
    // Initial auth check
    authClient.getSession()
      .then((response) => {
        if (response && 'data' in response && response.data && response.data.user) {
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
                user: response.data.user,
                isLoading: false,
                isAdmin,
                isPremium,
              })
            })
            .catch(() => {
              setAuthState({
                user: response.data.user,
                isLoading: false,
                isAdmin: false,
                isPremium: false,
              })
            })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAdmin: false,
            isPremium: false,
          })
        }
      })
      .catch(() => {
        setAuthState({
          user: null,
          isLoading: false,
          isAdmin: false,
          isPremium: false,
        })
      })
  }, [])

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
