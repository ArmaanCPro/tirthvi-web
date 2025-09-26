import { NextResponse } from 'next/server';

export function getCacheHeaders(
  maxAge: number = 3600, // 1 hour default
  staleWhileRevalidate: number = 86400, // 24 hours
  tags: string[] = []
) {
  const headers = new Headers();
  
  // Cache-Control header
  headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
  
  // CDN cache tags for invalidation
  if (tags.length > 0) {
    headers.set('Cache-Tags', tags.join(','));
  }
  
  // Vary header for proper caching
  headers.set('Vary', 'Accept-Encoding');
  
  return headers;
}

export function withCacheHeaders(
  response: NextResponse,
  maxAge: number = 3600,
  staleWhileRevalidate: number = 86400,
  tags: string[] = []
) {
  const headers = getCacheHeaders(maxAge, staleWhileRevalidate, tags);
  
  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Predefined cache strategies
export const CACHE_STRATEGIES = {
  // Static content - cache for 1 day
  STATIC: { maxAge: 86400, staleWhileRevalidate: 604800, tags: ['static'] as string[] },
  
  // Dynamic content - cache for 1 hour
  DYNAMIC: { maxAge: 3600, staleWhileRevalidate: 86400, tags: ['dynamic'] as string[] },
  
  // Events - cache for 1 hour with event tags
  EVENTS: { maxAge: 3600, staleWhileRevalidate: 86400, tags: ['events'] as string[] },
  
  // API responses - cache for 30 minutes
  API: { maxAge: 1800, staleWhileRevalidate: 3600, tags: ['api'] as string[] },
};
