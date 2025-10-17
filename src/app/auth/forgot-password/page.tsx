"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background"
import { GradientText } from "@/components/ui/shadcn-io/gradient-text"
import { FlipWords } from "@/components/ui/shadcn-io/flip-words"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success("Password reset email sent!")
      } else {
        setError(data.error || "Failed to send reset email")
        toast.error(data.error || "Failed to send reset email")
      }
    } catch {
      setError("Something went wrong. Please try again.")
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const words = ["Reset", "Your", "Password"]

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
                    We&apos;ve sent a password reset link to your email address.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Please check your email and click the link to reset your password.</p>
                  <p>The link will expire in 1 hour.</p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">Back to Sign In</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/reset-password">I have a reset token</Link>
                  </Button>
                </div>
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
            We&apos;ll send you a reset link
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
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-border/40 focus:border-primary/50 transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
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
