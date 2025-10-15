'use client'

import { Scripture } from '@/lib/schemas/scripture'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DownloadButton } from './download-button'
import { UsageStats } from './usage-stats'
import { ExternalLink, BookOpen, Calendar, User, Globe } from 'lucide-react'
import Image from 'next/image'
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom'

interface ScriptureDetailProps {
  scripture: Scripture
}

export function ScriptureDetail({ scripture }: ScriptureDetailProps) {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold">{scripture.title}</h1>
              {scripture.isPremium && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 self-start">
                  Premium
                </Badge>
              )}
            </div>
            
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {scripture.description}
            </p>
          </div>

          {/* Image with Zoom and Caption Overlay */}
          {scripture.image && (
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <ImageZoom className="w-full h-full object-cover relative">
                <Image
                  src={scripture.image.url}
                  alt={scripture.image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  unoptimized
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </ImageZoom>
              {scripture.image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  <p className="text-sm">{scripture.image.caption}</p>
                </div>
              )}
            </div>
          )}

          {/* Commentary */}
          {scripture.commentary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Commentary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {scripture.commentary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Scripture Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {scripture.metadata.chapters && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{scripture.metadata.chapters}</strong> chapters
                    </span>
                  </div>
                )}
                
                {scripture.metadata.verses && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{scripture.metadata.verses}</strong> verses
                    </span>
                  </div>
                )}
                
                {scripture.metadata.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Language:</strong> {scripture.metadata.language}
                    </span>
                  </div>
                )}
                
                {scripture.metadata.period && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Period:</strong> {scripture.metadata.period}
                    </span>
                  </div>
                )}
                
                {scripture.metadata.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Author:</strong> {scripture.metadata.author}
                    </span>
                  </div>
                )}
                
                {scripture.metadata.category && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Category:</strong> {scripture.metadata.category}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* External Links */}
          {scripture.externalLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Related Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scripture.externalLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <ExternalLink className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-600 hover:text-blue-800">
                            {link.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <DownloadButton scripture={scripture} />
          <UsageStats />
        </div>
      </div>
    </div>
  )
}
