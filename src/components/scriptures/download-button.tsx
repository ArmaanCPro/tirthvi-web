// protected download button component for scriptures

'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Download, Crown, Loader2 } from 'lucide-react'
import { Scripture } from '@/lib/schemas/scripture'
import { toast } from 'sonner'
import { Protect } from '@clerk/nextjs'

interface DownloadButtonProps {
    scripture: Scripture
}

export function DownloadButton({ scripture }: DownloadButtonProps) {
    const { user } = useUser()
    const [downloading, setDownloading] = useState(false)

    const handleDownload = async () => {
        if (!user) {
            return
        }

        setDownloading(true)
        try {
            const response = await fetch(`/api/scriptures/${scripture.slug}/download`)
            const data = await response.json()

            if (!response.ok) {
                if (data.upgradeRequired) {
                    toast.error('Download limit reached. Upgrade to a premium plan to download this scripture.')
                } else {
                    toast.error(data.error || 'Download failed')
                }
                return
            }

            // Open the download URL
            window.open(data.downloadUrl, '_blank')
            toast.success('Download started!')
        } catch (error) {
            console.error('Error downloading scripture:', error)
            toast.error('Download failed. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    if (!user) {
        return (
            <Button disabled className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Sign in to download
            </Button>
        )
    }

    return (
        <Protect
        condition={(has) => has({ feature: 'unlimited_scripture_downloads' })}
        fallback={
            <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full"
            >
                {downloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Download className="w-4 h-4 mr-2" />
                )}
                {downloading ? 'Preparing...' : 'Download PDF'}
            </Button>
        }
        >
            <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
                {downloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Crown className="w-4 h-4 mr-2" />
                )}
                {downloading ? 'Preparing...' : 'Download PDF (Premium)'}
            </Button>
        </Protect>
    )
}
