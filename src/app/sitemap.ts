import { MetadataRoute } from "next";
import { getAllEvents } from "@/lib/events";
import { getAllScriptures } from "@/lib/scriptures";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const events = await getAllEvents();
    const scriptures = await getAllScriptures();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const eventUrls = events.map(event => ({
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.6,
    }));

    const scriptureUrls = scriptures.map(scripture => ({
        url: `${baseUrl}/scriptures/${scripture.slug}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.7,
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
        {
            url: `${baseUrl}/scriptures`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        ...eventUrls,
        ...scriptureUrls,

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

        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.5,
        },

        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.1,
        },
    ];
}