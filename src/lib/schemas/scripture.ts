import { z } from 'zod'

export const ScriptureSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    commentary: z.string().optional(),
    image: z.object({
        url: z.string(),
        alt: z.string(),
        caption: z.string(),
    }),
    storagePath: z.string().min(1, 'Storage path is required'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    metadata: z.object({
        chapter: z.number().optional(),
        verses: z.number().optional(),
        language: z.string().optional(),
        period: z.string().optional(),
        author: z.string().optional(),
        category: z.string().optional(),
    }).default({}),
    externalLinks: z.array(z.object({
        title: z.string(),
        url: z.string().url(),
        description: z.string(),
    })).default([]),
    isPremium: z.boolean().default(false),
})

export type Scripture = z.infer<typeof ScriptureSchema>
