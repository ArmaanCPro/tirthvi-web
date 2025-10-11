"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PricingPage() {
    const [loading, setLoading] = useState(false);

    async function handleSubscribe(plan: "premium_monthly" | "premium_yearly") {
        setLoading(true);
        const res = await fetch("/api/stripe/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        setLoading(false);
        if (data.url) window.location.href = data.url;
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 justify-center py-10">
            <Card className="p-6 w-full md:w-80 text-center">
                <h2 className="text-xl font-bold mb-2">Premium Monthly</h2>
                <p className="text-muted-foreground mb-4">$10/month</p>
                <Button disabled={loading} onClick={() => handleSubscribe("premium_monthly")}>
                    Subscribe Monthly
                </Button>
            </Card>

            <Card className="p-6 w-full md:w-80 text-center border-amber-500">
                <h2 className="text-xl font-bold mb-2">Premium Yearly</h2>
                <p className="text-muted-foreground mb-4">$100/year</p>
                <Button disabled={loading} onClick={() => handleSubscribe("premium_yearly")}>
                    Subscribe Yearly
                </Button>
            </Card>
        </div>
    );
}
