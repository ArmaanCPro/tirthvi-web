"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react"
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background"
import { GradientText } from "@/components/ui/shadcn-io/gradient-text"
import { FlipWords } from "@/components/ui/shadcn-io/flip-words"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [token, setToken] = useState("")
  
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError("Invalid or missing reset token")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (!token) {
      setError("Invalid reset token")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Password reset successfully!")
      } else {
        setError(data.error || "Failed to reset password")
        toast.error(data.error || "Failed to reset password")
      }
    } catch {
      setError("Something went wrong. Please try again.")
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const words = ["New", "Password", "Set"]

  if (isSuccess) {
    return (
      <AuroraBackground>
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="mb-8 text-center">
            <Link href="/auth/signin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/tirthvi-icon.svg"
                alt="Tirthvi logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg"
              />
              <GradientText 
                text="Tirthvi" 
                className="text-3xl font-bold"
                gradient="linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)"
              />
            </div>
          </div>

          <Card className="backdrop-blur-sm bg-background/80 border-border/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-semibold mb-2">
                    <FlipWords words={words} className="text-2xl font-semibold" />
                  </h1>
                  <p className="text-muted-foreground">
                    Your password has been successfully reset.
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link href="/auth/signin">Sign In to Your Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuroraBackground>
    )
  }

  return (
    <AuroraBackground>
      <div className="relative z-10 w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <Link href="/auth/signin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/tirthvi-icon.svg"
              alt="Tirthvi logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <GradientText 
              text="Tirthvi" 
              className="text-2xl font-semibold"
              gradient="linear-gradient(90deg, #3b82f6 0%, #a855f7 20%, #ec4899 50%, #a855f7 80%, #3b82f6 100%)"
            />
          </div>
          
          <h1 className="text-xl font-medium mb-2 text-foreground">
            <FlipWords words={words} className="text-xl font-medium" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a strong password
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-background/95 border-border/20 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-border/40 focus:border-primary/50 transition-colors"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-border/40 focus:border-primary/50 transition-colors"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/auth/signin" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  )
}
