"use client"

import { ReactNode } from "react"

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  // Better Auth handles sessions server-side, no provider needed
  return <>{children}</>
}
