// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface NotificationRequest {
  notifications: Array<{
    eventName: string
    eventDate: string
    eventDescription: string
    userEmail: string
    userName: string
  }>
  eventSlug: string
  notificationType: 'reminder' | 'upcoming'
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { notifications, eventSlug, notificationType }: NotificationRequest = await req.json()

    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ message: 'No notifications to send' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Send emails using Supabase's built-in email service
    const emailPromises = notifications.map(async (notification) => {
      const subject = notificationType === 'reminder' 
        ? `Reminder: ${notification.eventName} is tomorrow!`
        : `Upcoming Event: ${notification.eventName}`

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🕉️ Tirthvi - Hindu Wisdom Hub</h2>
          
          <h3>${subject}</h3>
          
          <p>Dear ${notification.userName},</p>
          
          <p>We wanted to remind you about the upcoming Hindu celebration:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e293b;">${notification.eventName}</h4>
            <p style="margin: 5px 0; color: #64748b;"><strong>Date:</strong> ${notification.eventDate}</p>
            <p style="margin: 5px 0; color: #64748b;"><strong>Type:</strong> ${notificationType === 'reminder' ? 'Reminder' : 'Upcoming Event'}</p>
          </div>
          
          <p>${notification.eventDescription.substring(0, 200)}...</p>
          
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tirthvi.com'}/events/${eventSlug}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Event Details
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            You're receiving this because you subscribed to notifications for this event. 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tirthvi.com'}/dashboard">Manage your subscriptions</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Tirthvi - Hindu Wisdom Hub | <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tirthvi.com'}">Visit our website</a>
          </p>
        </div>
      `

      // Use Supabase's built-in email service
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: notification.userEmail,
          subject,
          html: htmlContent,
        }),
      })

      if (!response.ok) {
        console.error(`Failed to send email to ${notification.userEmail}:`, await response.text())
        return { success: false, email: notification.userEmail }
      }

      return { success: true, email: notification.userEmail }
    })

    const results = await Promise.all(emailPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return new Response(JSON.stringify({
      message: `Sent ${successful} emails successfully, ${failed} failed`,
      successful,
      failed,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in send-event-notification function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
