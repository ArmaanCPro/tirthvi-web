import { PricingTable } from "@clerk/nextjs"
import { Metadata } from "next"

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
        <div className="flex w-full justify-center" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem', paddingTop: '2rem', }}>
            <PricingTable />
        </div>
    )
}