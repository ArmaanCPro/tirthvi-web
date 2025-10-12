import { PricingTable } from "@clerk/nextjs"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'Pricing',
    description: 'Subscription Plans for Tirthvi',
    alternates: {
        canonical: '/pricing',
    },
    openGraph: {
        title: 'Pricing',
        description: 'Subscription Plans for Tirthvi',
        type: 'website',
    },
    twitter: {
        title: 'Pricing',
        description: 'Subscription Plans for Tirthvi',
        card: 'summary',
    }
}

export default function PricingPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
            <PricingTable />
        </div>
    )
}