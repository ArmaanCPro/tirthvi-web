import { Resend } from 'resend'

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
    const html = getOTPEmailTemplate(otp, type)
    
    const { data, error } = await resend.emails.send({
      from: 'Tirthvi <noreply@tirthvi.com>',
      to: [email],
      subject,
      html,
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
  url, 
  token 
}: { 
  user: { email: string; name?: string }
  url: string
  token: string
}) {
  try {
    const html = getPasswordResetEmailTemplate(user.name || 'User', url)
    
    const { data, error } = await resend.emails.send({
      from: 'Tirthvi <noreply@tirthvi.com>',
      to: [user.email],
      subject: 'Reset your Tirthvi password',
      html,
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

function getOTPEmailTemplate(otp: string, type: string): string {
  const title = getEmailTitle(type)
  const description = getEmailDescription(type)
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .otp-code {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 4px;
          color: #1e293b;
          font-family: 'Courier New', monospace;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 14px;
          color: #64748b;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Tirthvi</div>
        <h1>${title}</h1>
      </div>
      
      <p>${description}</p>
      
      <div class="otp-code">${otp}</div>
      
      <p>This code will expire in 10 minutes for security reasons.</p>
      
      <p>If you didn't request this code, please ignore this email.</p>
      
      <div class="footer">
        <p>This email was sent by Tirthvi - Your Hindu Wisdom Hub</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </body>
    </html>
  `
}

function getPasswordResetEmailTemplate(name: string, url: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your Tirthvi password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 14px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Tirthvi</div>
        <h1>Reset your password</h1>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>We received a request to reset your password for your Tirthvi account.</p>
      
      <p>Click the button below to reset your password:</p>
      
      <div style="text-align: center;">
        <a href="${url}" class="button">Reset Password</a>
      </div>
      
      <p>This link will expire in 1 hour for security reasons.</p>
      
      <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      
      <div class="footer">
        <p>This email was sent by Tirthvi - Your Hindu Wisdom Hub</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </body>
    </html>
  `
}

function getEmailTitle(type: string): string {
  switch (type) {
    case 'email-verification':
      return 'Verify your email address'
    case 'sign-in':
      return 'Your sign-in code'
    case 'forget-password':
      return 'Reset your password'
    default:
      return 'Your verification code'
  }
}

function getEmailDescription(type: string): string {
  switch (type) {
    case 'email-verification':
      return 'Please use the verification code below to complete your account setup:'
    case 'sign-in':
      return 'Use the code below to sign in to your Tirthvi account:'
    case 'forget-password':
      return 'Use the code below to reset your password:'
    default:
      return 'Please use the verification code below:'
  }
}
