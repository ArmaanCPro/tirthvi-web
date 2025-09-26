import { NextRequest } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { profiles } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      await db.insert(profiles).values({
        id: crypto.randomUUID(),
        clerkId: id,
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        avatarUrl: image_url,
      })
    } catch (error) {
      console.error('Error creating user profile:', error)
      return new Response('Error creating user profile', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    try {
      await db
        .update(profiles)
        .set({
          email: email_addresses[0]?.email_address,
          firstName: first_name,
          lastName: last_name,
          avatarUrl: image_url,
          updatedAt: new Date(),
        })
        .where(eq(profiles.clerkId, id!))
    } catch (error) {
      console.error('Error updating user profile:', error)
      return new Response('Error updating user profile', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      await db.delete(profiles).where(eq(profiles.clerkId, id!))
    } catch (error) {
      console.error('Error deleting user profile:', error)
      return new Response('Error deleting user profile', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
