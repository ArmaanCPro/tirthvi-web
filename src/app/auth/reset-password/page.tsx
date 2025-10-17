import { Suspense } from "react"
import { auth } from "@/lib/auth-config"
import { redirect } from "next/navigation"
import ResetPasswordForm from "./reset-password-form"

export default async function ResetPasswordPage() {
  const session = await auth()
  
  // If user is already authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <Suspense fallback={<ResetPasswordForm />}>
      <ResetPasswordForm />
    </Suspense>
  )
}