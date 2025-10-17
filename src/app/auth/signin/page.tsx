import { Suspense } from "react"
import { auth } from "@/lib/auth-config"
import { redirect } from "next/navigation"
import SignInForm from "./signin-form"

export default async function SignInPage() {
  const session = await auth()
  
  // If user is already authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <Suspense fallback={<SignInForm />}>
      <SignInForm />
    </Suspense>
  )
}