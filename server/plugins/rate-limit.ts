interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimits = new Map<string, RateLimitEntry>()

// Rate limiting configuration
const RATE_LIMITS = {
  // General API rate limit: 100 requests per minute per user
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  },
  // Stricter limit for write operations: 20 requests per minute per user
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const url = getRequestURL(event)
    const userId = getHeader(event, 'x-telegram-user-id')

    // Skip rate limiting for non-API routes or if no user ID
    if (!url.pathname.startsWith('/api') || !userId) {
      return
    }

    const method = event.method
    const isWriteOperation = ['POST', 'PUT', 'DELETE'].includes(method)

    const limit = isWriteOperation ? RATE_LIMITS.write : RATE_LIMITS.general
    const key = `${userId}:${url.pathname}`

    const now = Date.now()
    const entry = rateLimits.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimits.set(key, {
        count: 1,
        resetTime: now + limit.windowMs
      })
    } else {
      // Within window
      if (entry.count >= limit.maxRequests) {
        // Rate limit exceeded
        throw createError({
          statusCode: 429,
          statusMessage: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`
        })
      }
      entry.count++
    }
  })

  // Clean up expired entries periodically
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimits.entries()) {
      if (now > entry.resetTime) {
        rateLimits.delete(key)
      }
    }
  }, 60000) // Clean up every minute
})