// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Subscriber {
  user_id: string
  email: string
  first_name: string
  last_name: string
}

interface TomorrowEvent {
  event_slug: string
  event_name: string
  event_description: string
  event_date: string
  subscribers: Subscriber[]
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('Processing daily event notifications...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all events happening tomorrow with their subscribers
    const { data: tomorrowEvents, error } = await supabase
      .rpc('get_tomorrows_events')

    if (error) {
      throw new Error(`Failed to get tomorrow's events: ${error.message}`)
    }

    if (!tomorrowEvents || tomorrowEvents.length === 0) {
      console.log('No events happening tomorrow')
      return new Response(JSON.stringify({ 
        message: 'No events happening tomorrow',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let totalSent = 0
    const results = []

    // Process each event
    for (const event of tomorrowEvents) {
      console.log(`Processing event: ${event.event_name} (${event.event_slug})`)
      
      if (!event.subscribers || event.subscribers.length === 0) {
        console.log(`No subscribers for ${event.event_name}`)
        continue
      }

      let eventSentCount = 0
      const eventResults = []

      // Send notification to each subscriber
      for (const subscriber of event.subscribers) {
        try {
          // Check if we already sent a notification for this event/date
          const { data: existingNotification } = await supabase
            .from('notification_history')
            .select('id')
            .eq('event_slug', event.event_slug)
            .eq('user_id', subscriber.user_id)
            .eq('event_date', event.event_date)
            .eq('notification_type', 'reminder')
            .single()

          if (existingNotification) {
            console.log(`Already notified ${subscriber.email} about ${event.event_name}`)
            continue
          }

          // Send email notification using Supabase's built-in email service
          const emailSent = await sendEventEmail({
            to: subscriber.email,
            userName: `${subscriber.first_name} ${subscriber.last_name}`.trim(),
            eventName: event.event_name,
            eventDescription: event.event_description,
            eventDate: event.event_date,
            eventSlug: event.event_slug
          })

          if (emailSent) {
            // Record the notification in history
            await supabase
              .from('notification_history')
              .insert({
                event_slug: event.event_slug,
                user_id: subscriber.user_id,
                event_date: event.event_date,
                notification_type: 'reminder'
              })

            eventSentCount++
            totalSent++
            eventResults.push({
              email: subscriber.email,
              status: 'sent'
            })
          } else {
            eventResults.push({
              email: subscriber.email,
              status: 'failed',
              error: 'Email sending failed'
            })
          }

        } catch (error) {
          console.error(`Error processing subscriber ${subscriber.email}:`, error)
          eventResults.push({
            email: subscriber.email,
            status: 'error',
            error: error.message
          })
        }
      }

      results.push({
        event_slug: event.event_slug,
        event_name: event.event_name,
        subscribers: event.subscribers.length,
        emails_sent: eventSentCount,
        results: eventResults
      })

      console.log(`Sent ${eventSentCount} notifications for ${event.event_name}`)
    }

    console.log(`Daily notification processing completed. Sent ${totalSent} total notifications`)

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${tomorrowEvents.length} events, sent ${totalSent} notifications`,
      events_processed: tomorrowEvents.length,
      total_notifications_sent: totalSent,
      results,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Notification processing failed:', error)
    return new Response(JSON.stringify({ 
      error: 'Notification processing failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Helper function to send email notifications using Supabase's built-in email service
async function sendEventEmail({
  to,
  userName,
  eventName,
  eventDescription,
  eventDate,
  eventSlug
}: {
  to: string
  userName: string
  eventName: string
  eventDescription: string
  eventDate: string
  eventSlug: string
}): Promise<boolean> {
  try {
    const subject = `Reminder: ${eventName} is tomorrow!`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🕉️ Tirthvi - Hindu Wisdom Hub</h2>
        
        <h3>${subject}</h3>
        
        <p>Dear ${userName},</p>
        
        <p>We wanted to remind you about the upcoming Hindu celebration:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e293b;">${eventName}</h4>
          <p style="margin: 5px 0; color: #64748b;"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0; color: #64748b;"><strong>Type:</strong> Reminder</p>
        </div>
        
        <p>${eventDescription.substring(0, 200)}...</p>
        
        <div style="margin: 30px 0;">
          <a href="${Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://tirthvi.com'}/events/${eventSlug}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Event Details
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          You're receiving this because you subscribed to notifications for this event. 
          <a href="${Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://tirthvi.com'}/dashboard">Manage your subscriptions</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          Tirthvi - Hindu Wisdom Hub | <a href="${Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://tirthvi.com'}">Visit our website</a>
        </p>
      </div>
    `

    // Use Supabase's built-in email service
    // This uses Supabase's email functionality - no external services needed
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      console.error(`Failed to send email to ${to}:`, await response.text())
      return false
    }

    console.log(`Email sent successfully to ${to} about ${eventName}`)
    return true

  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
