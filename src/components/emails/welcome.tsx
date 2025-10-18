import {
  Body,
  Button,
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

interface WelcomeEmailProps {
  userName: string
  dashboardUrl: string
}

export const WelcomeEmail = ({
  userName,
  dashboardUrl,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Tirthvi - Your Hindu Wisdom Hub</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://tirthvi.com/tirthvi-icon.svg"
              width="40"
              height="40"
              alt="Tirthvi"
              style={logo}
            />
            <Heading style={logoText}>Tirthvi</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Welcome to Tirthvi!</Heading>
            <Text style={text}>Hello {userName},</Text>
            <Text style={text}>
              Welcome to Tirthvi, your comprehensive hub for Hindu philosophy and knowledge. 
              We&apos;re thrilled to have you join our community of spiritual seekers.
            </Text>

            <Text style={text}>
              With Tirthvi, you can:
            </Text>

            <Section style={featuresList}>
              <Text style={featureItem}>📅 Access our comprehensive Hindu calendar</Text>
              <Text style={featureItem}>💾 Save and track your favorite events</Text>
              <Text style={featureItem}>🔔 Subscribe to event notifications</Text>
              <Text style={featureItem}>📚 Explore our library of Hindu scriptures</Text>
              <Text style={featureItem}>🤖 Chat with our AI wisdom assistant</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Get Started
              </Button>
            </Section>

            <Text style={text}>
              If you have any questions or need help getting started, 
              don&apos;t hesitate to reach out to our support team.
            </Text>

            <Text style={text}>
              May your spiritual journey be filled with wisdom and peace.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by Tirthvi - Your Hindu Wisdom Hub
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

const featuresList = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const featureItem = {
  color: '#1e293b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
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

export default WelcomeEmail
