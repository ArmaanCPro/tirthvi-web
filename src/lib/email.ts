import { Resend } from 'resend'
import { render } from '@react-email/render'
import OTPVerificationEmail from '@/components/emails/otp-verification'
import PasswordResetEmail from '@/components/emails/password-reset'
import WelcomeEmail from '@/components/emails/welcome'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

/**
 * Send verification OTP email for email verification
 */
export async function sendVerificationOTP({
  email,
  otp, 
  type 
}: { 
  email: string
  otp: string
  type: 'email-verification' | 'sign-in' | 'forget-password'
}) {
  try {
    const subject = getEmailSubject(type)
    
    // Get user's name from database
    let userName = email.split('@')[0] // Fallback to email prefix
    try {
      const user = await db.select({ name: profiles.name })
        .from(profiles)
        .where(eq(profiles.email, email))
        .limit(1)
      
      if (user.length > 0 && user[0].name) {
        userName = user[0].name
      }
    } catch (error) {
      console.warn('Could not fetch user name from database:', error)
    }
    
    // Render React email component
    const emailHtml = await render(
      OTPVerificationEmail({ 
        otp, 
        type, 
        userName
      })
    )
    
    const { data, error } = await resend.emails.send({
      from: `Tirthvi <${process.env.EMAIL_FROM!}>`,
      to: [email],
      subject,
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send verification OTP:', error)
      throw new Error('Failed to send verification email')
    }

    console.log('Verification OTP sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Error sending verification OTP:', error)
    throw new Error('Failed to send verification email')
  }
}

/**
 * Send password reset email using Better Auth's built-in method
 */
export async function sendPasswordResetEmail({ 
  user, 
  url
}: { 
  user: { email: string; name?: string }
  url: string
}) {
  try {
    // Render React email component
    const emailHtml = await render(
      PasswordResetEmail({ 
        userName: user.name || user.email.split('@')[0],
        resetUrl: url
      })
    )
    
    const { data, error } = await resend.emails.send({
      from: `Tirthvi <${process.env.EMAIL_FROM!}>`,
      to: [user.email],
      subject: 'Reset your Tirthvi password',
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send password reset email:', error)
      throw new Error('Failed to send password reset email')
    }

    console.log('Password reset email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail({ 
  userEmail, 
  userName 
}: { 
  userEmail: string
  userName: string
}) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
    
    // Render React email component
    const emailHtml = await render(
      WelcomeEmail({ 
        userName,
        dashboardUrl
      })
    )
    
    const { data, error } = await resend.emails.send({
      from: `Tirthvi <${process.env.EMAIL_FROM!}>`,
      to: [userEmail],
      subject: 'Welcome to Tirthvi - Your Hindu Wisdom Hub',
      html: emailHtml,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      throw new Error('Failed to send welcome email')
    }

    console.log('Welcome email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw new Error('Failed to send welcome email')
  }
}

function getEmailSubject(type: string): string {
  switch (type) {
    case 'email-verification':
      return 'Verify your Tirthvi account'
    case 'sign-in':
      return 'Your Tirthvi sign-in code'
    case 'forget-password':
      return 'Reset your Tirthvi password'
    default:
      return 'Your Tirthvi verification code'
  }
}
