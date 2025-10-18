"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

interface AuthContextType {
  user: { 
    id: string; 
    email: string; 
    name?: string; 
    image?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    emailVerified?: boolean;
  } | null
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
    // Use Better Auth's reactive session
    const { data: session, isPending } = authClient.useSession()
    
    if (isPending) {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      return
    }

    if (session) {
      // Check admin and premium status
      Promise.all([
        fetch('/api/auth/admin').then(res => res.json()),
        fetch('/api/auth/premium').then(res => res.json())
      ]).then(([adminData, premiumData]) => {
        setAuthState({
          user: {
            ...session.user,
            image: session.user.image || null
          },
          isLoading: false,
          isAdmin: adminData?.isAdmin || false,
          isPremium: premiumData?.isPremium || false,
        })
      }).catch(() => {
        setAuthState({
          user: {
            ...session.user,
            image: session.user.image || null
          },
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
