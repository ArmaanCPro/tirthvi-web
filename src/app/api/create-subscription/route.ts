import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
    const { userId } = await auth();
    const { plan } = await req.json();

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: sub } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();

    let customerId = sub?.stripe_customer_id;
    if (!customerId) {
        const customer = await stripe.customers.create({
            metadata: { clerk_user_id: userId },
        });
        customerId = customer.id;

        await supabase.from("subscriptions").insert({
            user_id: userId,
            stripe_customer_id: customerId,
            plan,
            status: "incomplete",
        });
    }

    const priceId = process.env[`STRIPE_PRICE_${plan.toUpperCase()}`];
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
    });

    function hasPaymentIntent(inv: Stripe.Invoice | string | null | undefined): inv is Stripe.Invoice & { payment_intent: string | Stripe.PaymentIntent | null } {
        return !!inv && typeof inv !== "string" && "payment_intent" in inv;
    }

    let clientSecret: string | null = null;
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | string | null | undefined;
    if (hasPaymentIntent(latestInvoice)) {
        const pi = latestInvoice.payment_intent;
        if (pi && typeof pi !== "string") {
            clientSecret = pi.client_secret ?? null;
        }
    }

    return NextResponse.json({
        clientSecret,
        subscriptionId: subscription.id,
    });
}
