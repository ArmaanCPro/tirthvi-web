"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface SignUpButtonProps {
  children: ReactNode
  mode?: "modal" | "redirect"
  className?: string
}

export function SignUpButton({ children, mode = "redirect", className }: SignUpButtonProps) {
  const handleSignUp = () => {
    if (mode === "modal") {
      // For now, redirect to sign up page
      // TODO: Implement modal sign up
      window.location.href = "/auth/signup"
    } else {
      window.location.href = "/auth/signup"
    }
  }

  return (
    <Button onClick={handleSignUp} className={className}>
      {children}
    </Button>
  )
}
