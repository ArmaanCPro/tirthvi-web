"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, ArrowLeft, CheckCircle, Mail } from "lucide-react"
import { toast } from "sonner"

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Get email from localStorage or URL params
    const storedEmail = localStorage.getItem('pendingVerificationEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Fallback: try to get email from URL params
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get('email')
      if (emailParam) {
        setEmail(emailParam)
      }
    }
  }, [])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a complete 6-digit code")
      toast.error("Please enter a complete 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log('Verifying email with:', { email, otp })
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const result = await response.json()
      console.log('Verification result:', result)

      if (!response.ok || result.error) {
        console.error('Verification error:', result.error)
        setError(result.error || "Invalid verification code")
        toast.error(result.error || "Invalid verification code")
      } else {
        setIsSuccess(true)
        toast.success("Email verified successfully!")
        localStorage.removeItem('pendingVerificationEmail')
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setError("Something went wrong. Please try again.")
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email address is required")
      toast.error("Email address is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/send-verification-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type: "email-verification" }),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        setError(result.error || "Failed to send verification code")
        toast.error(result.error || "Failed to send verification code")
      } else {
        setResendCooldown(60) // 60 second cooldown
        toast.success("Verification code sent!")
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError("Something went wrong. Please try again.")
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/auth/signin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tirthvi
              </h1>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Email Verified!
                  </h2>
                  <p className="text-muted-foreground">
                    Your email has been successfully verified. You can now access all features of Tirthvi.
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tirthvi
            </h1>
          </div>
          
          <h2 className="text-xl font-medium mb-2 text-foreground">
            Verify your email
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Code sent to {email || 'your email'}</span>
                  </div>
                  
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={isLoading}
                      className="gap-3"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot 
                          index={0} 
                          className="w-14 h-14 text-xl font-bold border-2 border-primary/20 hover:border-primary/50 transition-colors" 
                        />
                        <InputOTPSlot 
                          index={1} 
                          className="w-14 h-14 text-xl font-bold border-2 border-primary/20 hover:border-primary/50 transition-colors" 
                        />
                        <InputOTPSlot 
                          index={2} 
                          className="w-14 h-14 text-xl font-bold border-2 border-primary/20 hover:border-primary/50 transition-colors" 
                        />
                        <InputOTPSlot 
                          index={3} 
                          className="w-14 h-14 text-xl font-bold border-2 border-primary/20 hover:border-primary/50 transition-colors" 
                        />
                        <InputOTPSlot 
                          index={4} 
                          className="w-14 h-14 text-xl font-bold border-2 border-primary/20 hover:border-primary/50 transition-colors" 
                        />
                        <InputOTPSlot 
                          index={5} 
                          className="w-14 h-14 text-xl font-bold border-2 border-primary/20 hover:border-primary/50 transition-colors" 
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button 
                  onClick={handleVerifyOTP}
                  className="w-full" 
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isLoading || resendCooldown > 0}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
