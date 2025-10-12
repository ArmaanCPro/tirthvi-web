'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'

export default function ClerkClientProvider({ children }: { children: React.ReactNode }) {
    return <ClerkProvider appearance={{theme: shadcn}}> {children} </ClerkProvider>
}