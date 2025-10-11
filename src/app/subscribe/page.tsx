"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscribePage() {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function startSubscription(plan: string) {
        setLoading(true);
        const res = await fetch("/api/create-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
        setLoading(false);
    }

    if (!clientSecret) {
        return (
            <div className="max-w-md mx-auto py-10 text-center space-y-4">
                <h1 className="text-3xl font-bold">Choose a plan</h1>
                <Button onClick={() => startSubscription("premium")} disabled={loading}>
                    {loading ? "Loading..." : "Subscribe to Premium"}
                </Button>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
        </Elements>
    );
}

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!stripe || !elements) return;

        setSubmitting(true);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard?subscribed=true`,
            },
        });

        if (error) setMessage(error.message ?? "Payment failed");
        setSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card className="max-w-md mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Complete your payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <PaymentElement />
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button type="submit" disabled={!stripe || submitting}>
                        {submitting ? "Processing..." : "Pay"}
                    </Button>
                    {message && <p className="text-sm text-red-500">{message}</p>}
                </CardFooter>
            </Card>
        </form>
    );
}
