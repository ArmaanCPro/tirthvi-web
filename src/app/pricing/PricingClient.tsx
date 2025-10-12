"use client";

import { ClerkProvider, PricingTable } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

export default function PricingClient() {
    return (
        <ClerkProvider appearance={{ theme: shadcn }}>
            <PricingTable />
        </ClerkProvider>
    )
}
