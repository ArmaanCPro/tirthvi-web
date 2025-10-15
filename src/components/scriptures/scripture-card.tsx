'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Scripture } from '@/lib/schemas/scripture'
import { DownloadButton } from './download-button'

interface ScriptureCardProps {
    scripture: Scripture
}

export function ScriptureCard({ scripture }: ScriptureCardProps) {
    return (
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {scripture.image && (
                <div className="aspect-video relative overflow-hidden">
                    <Image
                        src={scripture.image.url}
                        alt={scripture.image.alt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {scripture.isPremium && (
                        <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                <Crown className="w-3 h-3 mr-1" />
                                Premium
                            </Badge>
                        </div>
                    )}
                </div>
            )}

            <CardHeader className="pb-3" >
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors font-semibold">
                    <Link href={`/scriptures/${scripture.slug}`} className="hover:text-blue-600 transition-colors">
                        {scripture.title}
                    </Link>
                </CardTitle>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {scripture.metadata.chapters && (
                        <span className="whitespace-nowrap">
                            {scripture.metadata.chapters} chapters
                        </span>
                    )}
                    {scripture.metadata.verses && (
                        <span className="whitespace-nowrap">{scripture.metadata.verses} verses</span>
                    )}
                    {scripture.metadata.language && (
                        <span className="whitespace-nowrap">{scripture.metadata.language}</span>
                    )}
                    {scripture.metadata.author && (
                        <span className="whitespace-nowrap">{scripture.metadata.author}</span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {scripture.description}
                </p>

                <DownloadButton scripture={scripture} />

                {scripture.externalLinks.length > 0 && (
                    <div className="space-y-2">
                        {scripture.externalLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{link.title}</span>
                            </a>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
