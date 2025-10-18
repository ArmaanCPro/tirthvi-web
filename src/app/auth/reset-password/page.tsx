import { auth } from "@/lib/auth-config"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import ResetPasswordForm from "./reset-password-form"

export default async function ResetPasswordPage() {
  // Check if user is authenticated - only authenticated users can reset password
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <Suspense fallback={<ResetPasswordForm />}>
      <ResetPasswordForm />
    </Suspense>
  )
}