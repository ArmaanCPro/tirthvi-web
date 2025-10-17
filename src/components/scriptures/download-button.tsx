// protected download button component for scriptures

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Download, Crown, Loader2 } from 'lucide-react'
import { Scripture } from '@/lib/schemas/scripture'
import { toast } from 'sonner'
import { Protect } from '@/components/auth'

interface DownloadButtonProps {
    scripture: Scripture
}

export function DownloadButton({ scripture }: DownloadButtonProps) {
    const { data: session } = useSession()
    const user = session?.user
    const [downloading, setDownloading] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        async function checkAdmin() {
            if (user?.id) {
                try {
                    const response = await fetch('/api/auth/admin')
                    const data = await response.json()
                    setIsAdmin(data.isAdmin || false)
                } catch (error) {
                    console.error('Error checking admin status:', error)
                }
            }
        }
        checkAdmin()
    }, [user?.id])

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
            <Button disabled className="w-full cursor-not-allowed min-h-[44px]">
                <Download className="w-4 h-4 mr-2" />
                Sign in to download
            </Button>
        )
    }

    // If user is admin, show premium button without protection
    if (isAdmin) {
        return (
            <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 cursor-pointer min-h-[44px]"
            >
                {downloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <Crown className="w-4 h-4 mr-2" />
                )}
                {downloading ? 'Preparing...' : 'Download PDF (Admin)'}
            </Button>
        )
    }

    return (
        <Protect
        plan="premium"
        fallback={
            <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full cursor-pointer min-h-[44px]"
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
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 cursor-pointer min-h-[44px]"
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
