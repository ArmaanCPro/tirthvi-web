import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { profiles } from "@/lib/drizzle";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;

                // Determine premium status based on subscription status
                const status = subscription.status;
                const isActive = status === "active" || status === "trialing" || status === "past_due";

                // Try to get Clerk user id from subscription metadata
                const meta = subscription.metadata as Stripe.Metadata | null | undefined;
                let clerkUserId = meta?.["clerk_user_id"] ?? meta?.["userId"];

                // Fallback: fetch the customer and read metadata if needed
                if (!clerkUserId && subscription.customer) {
                    const customer = await stripe.customers.retrieve(subscription.customer as string);
                    if (!("deleted" in customer)) {
                        const m = (customer as Stripe.Customer).metadata as Stripe.Metadata | undefined;
                        clerkUserId = m?.["clerk_user_id"] ?? m?.["userId"];
                    }
                }

                if (clerkUserId) {
                    await db.update(profiles)
                      .set({ isPremium: isActive })
                      .where(eq(profiles.clerkId, clerkUserId));
                }
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const meta = subscription.metadata as Stripe.Metadata | null | undefined;
                let clerkUserId = meta?.["clerk_user_id"] ?? meta?.["userId"];
                if (!clerkUserId && subscription.customer) {
                    const customer = await stripe.customers.retrieve(subscription.customer as string);
                    if (!("deleted" in customer)) {
                        const m = (customer as Stripe.Customer).metadata as Stripe.Metadata | undefined;
                        clerkUserId = m?.["clerk_user_id"] ?? m?.["userId"];
                    }
                }
                if (clerkUserId) {
                    await db.update(profiles)
                      .set({ isPremium: false })
                      .where(eq(profiles.clerkId, clerkUserId));
                }
                break;
            }
            default:
                // Ignore other events
                break;
        }

        return NextResponse.json({ received: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error("Stripe webhook processing error:", message);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
