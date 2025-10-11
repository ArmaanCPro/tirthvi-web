import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });


        const { plan } = await req.json();
        let priceId = "";

        switch (plan) {
            case "premium_monthly":
                priceId = process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY!;
                break;
            case "premium_yearly":
                priceId = process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY!;
                break;
            default:
                return new NextResponse("Invalid plan", { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
            // Ensure the resulting subscription contains the Clerk user id
            subscription_data: { metadata: { clerk_user_id: userId } },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error("Stripe session error:", message);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
