// Simple performance utilities for monitoring

export function logPerformance<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
  if (process.env.NODE_ENV !== 'development') {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then((value) => {
      const end = performance.now();
      console.log(`⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
      return value;
    });
  } else {
    const end = performance.now();
    console.log(`⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
}

// Simple cache hit/miss logging
export function logCacheStatus(cacheKey: string, hit: boolean) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗄️  Cache ${hit ? 'HIT' : 'MISS'}: ${cacheKey}`);
  }
}
