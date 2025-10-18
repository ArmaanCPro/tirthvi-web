"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

interface AuthContextType {
  isAdmin: boolean
  isPremium: boolean
  isLoadingPermissions: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  isPremium: false,
  isLoadingPermissions: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<AuthContextType>({
    isAdmin: false,
    isPremium: false,
    isLoadingPermissions: false,
  })

  // Use Better Auth's reactive useSession hook
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending || !session?.user) {
      setPermissions({
        isAdmin: false,
        isPremium: false,
        isLoadingPermissions: false,
      })
      return
    }

    // Only fetch permissions when user changes
    setPermissions(prev => ({ ...prev, isLoadingPermissions: true }))
    
    const checkPermissions = async () => {
      try {
        const [adminResponse, premiumResponse] = await Promise.all([
          fetch('/api/auth/admin').then(res => res.json()),
          fetch('/api/auth/premium').then(res => res.json())
        ])
        
        setPermissions({
          isAdmin: adminResponse?.isAdmin || false,
          isPremium: premiumResponse?.isPremium || false,
          isLoadingPermissions: false,
        })
      } catch (error) {
        console.error('Permission check failed:', error)
        setPermissions({
          isAdmin: false,
          isPremium: false,
          isLoadingPermissions: false,
        })
      }
    }

    checkPermissions()
  }, [session?.user, isPending]) // Only re-run when user changes

  return (
    <AuthContext.Provider value={permissions}>
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

// Export Better Auth's useSession for direct access
export { authClient } from "@/lib/auth-client"
