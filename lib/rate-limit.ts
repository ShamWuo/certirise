/**
 * Simple rate limiting utility
 * For production, use Upstash Redis or Vercel Edge Config
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now()
  const key = identifier

  const record = rateLimitMap.get(key)

  // Clean up old entries
  if (record && record.resetTime < now) {
    rateLimitMap.delete(key)
  }

  const current = rateLimitMap.get(key)

  if (!current) {
    // First request
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    })
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    }
  }

  if (current.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }

  // Increment count
  current.count++
  rateLimitMap.set(key, current)

  return {
    allowed: true,
    remaining: options.maxRequests - current.count,
    resetTime: current.resetTime,
  }
}

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}




