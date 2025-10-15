// Download Scripture API Route

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/db'
import { getScripture } from '@/lib/scriptures'
import { checkDownloadLimit, recordDownload } from '@/lib/download-limits'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new Response('Unauthorized', { status: 401 })
        }

        const user = await getCurrentUser()
        if (!user) {
            return new Response('User not found', { status: 404 })
        }

        // Check download limits
        const { canDownload, remaining, limit, isPremium } = await checkDownloadLimit(user.id)
        if (!canDownload) {
            return NextResponse.json({
                error: 'Download limit reached',
                remaining,
                limit,
                upgradeRequired: true,
            }, { status: 429 })
        }

        const scripture = await getScripture(params.slug)
        if (!scripture) {
            return NextResponse.json({ error: 'Scripture not found' }, { status: 404 })
        }

        // Check if scripture requires premium access
        if (scripture.isPremium) {
            const { has } = await auth()
            if (!has({ feature: 'unlimited_scripture_downloads' })) {
                return NextResponse.json({
                    error: 'Premium scripture requires upgrade',
                }, { status: 403 })
            }
        }

        // Record download with scripture slug
        await recordDownload(user.id, params.slug, {
            scriptureTitle: scripture.title,
            isPremium: scripture.isPremium
        })

        // Create signed URL with 5 min expiry
        const { data, error } = await supabaseAdmin.storage
            .from('scriptures')
            .createSignedUrl(scripture.storagePath, 300)

        if (error || !data?.signedUrl) {
            return NextResponse.json({
                error: 'Failed to create signed URL for download',
            }, { status: 500 })
        }

        return NextResponse.json({
            downloadUrl: data.signedUrl,
            remaining: remaining - 1,
            limit
        })
    } catch (error) {
        console.error('Error downloading scripture:', error)
        return NextResponse.json({
            error: 'Internal Server Error: Failed to download scripture',
        }, { status: 500 })
    }
}
