import { Event } from '@/lib/schemas/event'
import { Scripture } from '@/lib/schemas/scripture'

interface StructuredDataProps {
  type: 'event' | 'scripture' | 'website' | 'organization'
  data?: Event | Scripture
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tirthvi.com'
    
    switch (type) {
      case 'event':
        if (!data || !('name' in data)) return null
        const event = data as Event
        return {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": event.name,
          "description": event.description,
          "image": event.image?.url,
          "startDate": event.occurrences ? Object.values(event.occurrences)[0]?.[0]?.date : undefined,
          "location": {
            "@type": "VirtualLocation",
            "name": "Online"
          },
          "organizer": {
            "@type": "Organization",
            "name": "Tirthvi",
            "url": baseUrl
          }
        }

      case 'scripture':
        if (!data || !('title' in data)) return null
        const scripture = data as Scripture
        return {
          "@context": "https://schema.org",
          "@type": "Book",
          "name": scripture.title,
          "description": scripture.description,
          "image": scripture.image?.url,
          "author": scripture.metadata?.author,
          "publisher": {
            "@type": "Organization",
            "name": "Tirthvi",
            "url": baseUrl
          }
        }

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Tirthvi - Hindu Wisdom Hub",
          "description": "A digital hub and AI tool for Hindu wisdom, philosophy, and scripture",
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${baseUrl}/chat?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        }

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Tirthvi",
          "description": "A digital hub for Hindu wisdom, philosophy, and scripture",
          "url": baseUrl,
          "logo": `${baseUrl}/tirthvi-icon.svg`
        }

      default:
        return null
    }
  }

  const structuredData = getStructuredData()
  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
