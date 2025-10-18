import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface OTPVerificationEmailProps {
  otp: string
  type: 'email-verification' | 'sign-in' | 'forget-password'
  userName?: string
}

export const OTPVerificationEmail = ({
  otp,
  type,
  userName = 'User',
}: OTPVerificationEmailProps) => {
  const getSubject = () => {
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

  const getTitle = () => {
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

  const getDescription = () => {
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

  return (
    <Html>
      <Head />
      <Preview>{getSubject()}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://www.tirthvi.com/tirthvi-icon.svg"
              width="40"
              height="40"
              alt="Tirthvi"
              style={logo}
            />
            <Heading style={logoText}>Tirthvi</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>{getTitle()}</Heading>
            <Text style={text}>Hello {userName},</Text>
            <Text style={text}>{getDescription()}</Text>

            <Section style={otpContainer}>
              <Text style={otpCode}>{otp}</Text>
            </Section>

            <Text style={text}>
              This code will expire in 10 minutes for security reasons.
            </Text>

             <Text style={text}>
               If you didn&apos;t request this code, please ignore this email.
             </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by Tirthvi
            </Text>
            <Text style={footerText}>
              If you have any questions, please contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}

const header = {
  padding: '32px 24px 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  borderRadius: '8px',
}

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  margin: '8px 0 0',
}

const content = {
  padding: '0 24px',
}

const h1 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const text = {
  color: '#64748b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const otpContainer = {
  backgroundColor: '#f8fafc',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '32px 0',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

const otpCode = {
  fontSize: '36px',
  fontWeight: 'bold',
  letterSpacing: '6px',
  color: '#1e293b',
  fontFamily: 'Courier New, monospace',
  margin: '0',
}

const footer = {
  padding: '24px',
  borderTop: '1px solid #e2e8f0',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

export default OTPVerificationEmail
