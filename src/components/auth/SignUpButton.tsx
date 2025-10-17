"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface SignUpButtonProps {
  children: ReactNode
  mode?: "modal" | "redirect"
  className?: string
}

export function SignUpButton({ children, className }: SignUpButtonProps) {
  const handleSignUp = () => {
    // For now, always redirect to sign up page
    // TODO: Implement modal sign up for mode="modal"
    window.location.href = "/auth/signup"
  }

  return (
    <Button onClick={handleSignUp} className={className}>
      {children}
    </Button>
  )
}
