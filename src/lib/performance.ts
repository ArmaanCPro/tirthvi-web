// Performance monitoring utilities
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  if (typeof window === 'undefined') {
    // Server-side: just execute the function
    return fn();
  }

  // Client-side: measure performance
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then((value) => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return value;
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
}

// Web Vitals reporting
export function reportWebVitals(metric: { name: string; value: number; delta: number; id: string; navigationType: string }) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
  
  // In production, you might want to send this to an analytics service
  // Example: send to Vercel Analytics, Google Analytics, etc.
}

// Resource hints for better performance
export function addResourceHints() {
  if (typeof document === 'undefined') return;
  
  // Preload critical resources
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.href = '/images/events/makar-sankranti.svg';
  preloadLink.as = 'image';
  document.head.appendChild(preloadLink);
  
  // Preconnect to external domains
  const preconnectLink = document.createElement('link');
  preconnectLink.rel = 'preconnect';
  preconnectLink.href = 'https://iskcon.org';
  document.head.appendChild(preconnectLink);
}
