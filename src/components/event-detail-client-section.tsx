'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'
import {SaveEventButton} from "@/components/save-event-button";
import {SubscribeEventButton} from "@/components/subscribe-event-button";

export default function EventDetailClientSection({ eventSlug }: { eventSlug: string }) {
    return (
        <ClerkProvider appearance={{ theme: shadcn }}>
            <div className={"flex flex-col sm:flex-row gap-3"}>
                <SaveEventButton eventSlug={eventSlug} className="flex-1 sm:flex-none" />
                <SubscribeEventButton eventSlug={eventSlug} className="flex-1 sm:flex-none" />
            </div>
        </ClerkProvider>
    )
}