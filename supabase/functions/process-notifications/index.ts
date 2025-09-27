// Supabase Edge Function to process event notifications with Resend email
// @ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventOccurrence {
  date: string
  startTime?: string
  endTime?: string
  timezone: string
  significance?: string
}

interface Event {
  id: string
  name: string
  description: string
  slug: string
  occurrences: Record<string, EventOccurrence[]>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Processing notifications for tomorrow...')

    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD format

    console.log(`Checking for events on: ${tomorrowStr}`)

    // Get all event subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('event_subscriptions')
      .select(`
        id,
        event_slug,
        user_id,
        notification_enabled,
        profiles!inner(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('notification_enabled', true)

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found')
      return new Response(
        JSON.stringify({ message: 'No active subscriptions found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${subscriptions.length} active subscriptions`)

    // Group subscriptions by event slug
    const subscriptionsByEvent = subscriptions.reduce((acc, sub) => {
      if (!acc[sub.event_slug]) {
        acc[sub.event_slug] = []
      }
      acc[sub.event_slug].push(sub)
      return acc
    }, {} as Record<string, any[]>)

    // Check each event for tomorrow's occurrences
    const eventsToNotify: Array<{
      eventSlug: string
      subscribers: any[]
    }> = []

    for (const [eventSlug, eventSubscriptions] of Object.entries(subscriptionsByEvent)) {
      // Check if this event occurs tomorrow
      const occursTomorrow = await checkEventOccursTomorrow(eventSlug, tomorrowStr)
      
      if (occursTomorrow) {
        eventsToNotify.push({
          eventSlug,
          subscribers: eventSubscriptions
        })
        console.log(`Event ${eventSlug} occurs tomorrow - ${eventSubscriptions.length} subscribers`)
      }
    }

    if (eventsToNotify.length === 0) {
      console.log('No events tomorrow')
      return new Response(
        JSON.stringify({ message: 'No events tomorrow' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send notifications for each event
    const results = []
    for (const { eventSlug, subscribers } of eventsToNotify) {
      const result = await sendEventNotifications(eventSlug, subscribers, tomorrowStr)
      results.push(result)
    }

    console.log(`Processed ${results.length} events for notifications`)

    return new Response(
      JSON.stringify({ 
        message: 'Notifications processed successfully',
        eventsProcessed: results.length,
        totalSubscribers: results.reduce((sum, r) => sum + r.subscribersNotified, 0)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing notifications:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Check if an event occurs on a specific date
async function checkEventOccursTomorrow(eventSlug: string, targetDate: string): Promise<boolean> {
  try {
    console.log(`Checking if ${eventSlug} occurs on ${targetDate}`)
    
    // Get the specific event data
    const nextjsUrl = Deno.env.get('NEXTJS_URL') || 'https://www.tirthvi.com'
    const response = await fetch(`${nextjsUrl}/api/events/${eventSlug}`)

    if (!response.ok) {
      console.error(`API call failed: ${response.status}`)
      return false
    }

    const eventData = await response.json()
    
    // Check if the event has an occurrence on the target date
    const hasOccurrence = Object.values(eventData.occurrences || {}).some((yearOccurrences: any) => 
      yearOccurrences.some((occurrence: any) => occurrence.date === targetDate)
    )
    
    console.log(`Event ${eventSlug} occurs on ${targetDate}: ${hasOccurrence}`)
    return hasOccurrence
    
  } catch (error) {
    console.error(`Error checking event ${eventSlug}:`, error)
    return false
  }
}

// Send notifications for an event
async function sendEventNotifications(eventSlug: string, subscribers: any[], eventDate: string) {
  console.log(`Sending notifications for ${eventSlug} to ${subscribers.length} subscribers`)
  
  // Get event details from your Next.js API
  const nextjsUrl = Deno.env.get('NEXTJS_URL') || 'https://www.tirthvi.com'
  const eventResponse = await fetch(`${nextjsUrl}/api/events/${eventSlug}`)
  
  if (!eventResponse.ok) {
    console.error(`Failed to fetch event details for ${eventSlug}`)
    return { eventSlug, subscribersNotified: 0, error: 'Failed to fetch event details' }
  }
  
  const eventData = await eventResponse.json()
  
  // Send email to each subscriber
  const emailResults = []
  for (const subscriber of subscribers) {
    try {
      const emailResult = await sendEmailNotification({
        to: subscriber.profiles.email,
        firstName: subscriber.profiles.first_name || 'Friend',
        eventName: eventData.name,
        eventDescription: eventData.description,
        eventDate: eventDate,
        eventSlug: eventSlug,
        eventImage: eventData.image?.url
      })
      emailResults.push(emailResult)
    } catch (error) {
      console.error(`Failed to send email to ${subscriber.profiles.email}:`, error)
      emailResults.push({ success: false, email: subscriber.profiles.email, error: error.message })
    }
  }
  
  const successfulEmails = emailResults.filter(r => r.success).length
  
  console.log(`Sent ${successfulEmails}/${subscribers.length} emails for ${eventSlug}`)
  
  return {
    eventSlug,
    subscribersNotified: successfulEmails,
    emailResults
  }
}

// Send email notification using Resend
async function sendEmailNotification({
  to,
  firstName,
  eventName,
  eventDescription,
  eventDate,
  eventSlug,
  eventImage
}: {
  to: string
  firstName: string
  eventName: string
  eventDescription: string
  eventDate: string
  eventSlug: string
  eventImage?: string
}) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }
  
  // Format the date nicely
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  // Create beautiful HTML email content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hindu Event Reminder - ${eventName}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f8f9fa;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px; 
          text-align: center;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px;
          font-weight: 600;
        }
        .header p { 
          margin: 10px 0 0 0; 
          font-size: 16px;
          opacity: 0.9;
        }
        .content { 
          padding: 30px 20px; 
        }
        .event-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .event-title {
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 10px 0;
        }
        .event-date {
          font-size: 18px;
          color: #667eea;
          font-weight: 500;
          margin: 0 0 15px 0;
        }
        .event-description {
          font-size: 16px;
          line-height: 1.6;
          color: #555;
        }
        .event-image {
          width: 100%;
          max-width: 300px;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          margin: 15px 0;
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 20px 0; 
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .footer { 
          background: #f8f9fa;
          padding: 20px; 
          text-align: center; 
          font-size: 14px; 
          color: #666; 
          border-top: 1px solid #e9ecef;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        .blessing {
          font-style: italic;
          color: #667eea;
          text-align: center;
          margin: 20px 0;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🕉️ Tirthvi</h1>
          <p>Namaste ${firstName},</p>
        </div>
        
        <div class="content">
          <div class="blessing">
            "May this sacred day bring you peace, prosperity, and spiritual growth."
          </div>
          
          <div class="event-card">
            <h2 class="event-title">${eventName}</h2>
            <p class="event-date">📅 ${formattedDate}</p>
            ${eventImage ? `<img src="${eventImage}" alt="${eventName}" class="event-image">` : ''}
            <div class="event-description">
              ${eventDescription}
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://your-app.vercel.app/events/${eventSlug}" class="button">
              View Full Event Details
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Tirthvi</strong> - Your Hindu Wisdom Hub</p>
          <p>To manage your event subscriptions, visit your <a href="https://your-app.vercel.app/dashboard">dashboard</a>.</p>
          <p>This is an automated reminder. If you no longer wish to receive these emails, you can unsubscribe from your dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  // Send email via Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Tirthvi <notifications@notifications.tirthvi.com>',
      to: [to],
      subject: `🕉️ Reminder: ${eventName} is tomorrow`,
      html: htmlContent,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${response.status} - ${error}`)
  }
  
  const result = await response.json()
  console.log(`Email sent successfully to ${to}: ${result.id}`)
  
  return {
    success: true,
    email: to,
    messageId: result.id
  }
}