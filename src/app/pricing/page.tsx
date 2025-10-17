import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Heart, Zap, Crown } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
    title: 'Pricing - Tirthvi',
    description: 'Subscription Plans for Tirthvi',
    alternates: {
        canonical: '/pricing',
    },
    openGraph: {
        title: 'Pricing - Tirthvi',
        description: 'Subscription Plans for Tirthvi',
        type: 'website',
    },
    twitter: {
        title: 'Pricing - Tirthvi',
        description: 'Subscription Plans for Tirthvi',
        card: 'summary',
    }
}

export default function PricingPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Unlock the full potential of Hindu wisdom with our premium features
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <Card className="relative">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-muted-foreground" />
                            Free
                        </CardTitle>
                        <CardDescription>
                            Perfect for exploring Hindu wisdom
                        </CardDescription>
                        <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Access to Hindu calendar</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Basic scripture library</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>5 AI messages per day</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Save events</span>
                            </li>
                        </ul>
                        <Button variant="outline" className="w-full" disabled>
                            Current Plan
                        </Button>
                    </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="relative border-primary">
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                        Most Popular
                    </Badge>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-primary" />
                            Premium
                        </CardTitle>
                        <CardDescription>
                            Full access to all features
                        </CardDescription>
                        <div className="text-3xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Everything in Free</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Unlimited AI conversations</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Advanced scripture search</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Event notifications</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>Priority support</span>
                            </li>
                        </ul>
                        <Button asChild className="w-full">
                            <Link href="/api/billing/create-checkout-session">
                                <Zap className="mr-2 h-4 w-4" />
                                Upgrade to Premium
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center mt-16">
                <p className="text-muted-foreground">
                    All plans include access to our comprehensive Hindu calendar and scripture library.
                </p>
            </div>
        </div>
    )
}