import { MetadataRoute } from "next";
import { getAllEvents } from "@/lib/events";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const events = await getAllEvents();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const eventUrls = events.map(event => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.6,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/calendar`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.8,
        },
        ...eventUrls,

        {
            url: `${baseUrl}/chat`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },

        {
            url: `${baseUrl}/dashboard`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];
}