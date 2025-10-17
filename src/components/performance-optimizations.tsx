'use client'

import { useEffect } from 'react'

// Preload critical resources
export function PreloadCriticalResources() {
  useEffect(() => {
    // Preload critical fonts
    const preloadFonts = () => {
      const fontUrls = [
        '/fonts/geist-sans.woff2',
        '/fonts/geist-mono.woff2'
      ]
      
      fontUrls.forEach(url => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = url
        link.as = 'font'
        link.type = 'font/woff2'
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      })
    }

    // Preload critical images
    const preloadImages = () => {
      const imageUrls = [
        '/tirthvi-icon.svg',
        '/android-chrome-512x512.png'
      ]
      
      imageUrls.forEach(url => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = url
        link.as = 'image'
        document.head.appendChild(link)
      })
    }

    preloadFonts()
    preloadImages()
  }, [])

  return null
}

// Resource hints for better performance
export function ResourceHints() {
  useEffect(() => {
    // Add DNS prefetch for external domains
    const dnsPrefetchDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://clerk.tirthvi.com',
      'https://supabase.com'
    ]

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = domain
      document.head.appendChild(link)
    })

    // Add preconnect for critical external resources
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ]

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }, [])

  return null
}

// Performance monitoring
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          console.log('CLS:', entry.value)
        }
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

    return () => observer.disconnect()
  }, [])

  return null
}

// Lazy loading optimization
export function LazyLoadingOptimizer() {
  useEffect(() => {
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
              observer.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '50px' }
    )

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]')
    lazyImages.forEach((img) => observer.observe(img))

    return () => observer.disconnect()
  }, [])

  return null
}
