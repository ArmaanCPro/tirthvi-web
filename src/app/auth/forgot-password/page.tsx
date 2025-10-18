import { auth } from "@/lib/auth-config"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import ForgotPasswordForm from "./forgot-password-form"

export default async function ForgotPasswordPage() {
  // Check if user is authenticated - only authenticated users can reset password
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/auth/signin')
  }

  return <ForgotPasswordForm />
}