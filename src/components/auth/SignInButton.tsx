"use client"

// import { signIn } from "next-auth/react" // For future use
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

interface SignInButtonProps {
  children: ReactNode
  mode?: "modal" | "redirect"
  className?: string
}

export function SignInButton({ children, mode = "redirect", className }: SignInButtonProps) {
  const handleSignIn = () => {
    // For now, always redirect to sign in page
    // TODO: Implement modal sign in for mode="modal"
    window.location.href = "/auth/signin"
  }

  return (
    <Button onClick={handleSignIn} className={className}>
      {children}
    </Button>
  )
}
