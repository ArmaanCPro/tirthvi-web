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
    // Use Better Auth's getSession method instead of useSession hook
    const checkAuth = async () => {
      try {
        const response = await authClient.getSession()
        
        if (response && 'data' in response && response.data && response.data.user) {
          // Check admin and premium status
          const [adminResponse, premiumResponse] = await Promise.all([
            fetch('/api/auth/admin').then(res => res.json()),
            fetch('/api/auth/premium').then(res => res.json())
          ])
          
          setAuthState({
            user: {
              ...response.data.user,
              image: response.data.user.image || null
            },
            isLoading: false,
            isAdmin: adminResponse?.isAdmin || false,
            isPremium: premiumResponse?.isPremium || false,
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAdmin: false,
            isPremium: false,
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAdmin: false,
          isPremium: false,
        })
      }
    }

    checkAuth()
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
