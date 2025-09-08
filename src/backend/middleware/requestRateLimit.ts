import { rateLimit } from 'express-rate-limit'

const requestRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20, // Limit each IP to 20 requests per minute
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the legacy `X-RateLimit-*` headers
})

export { requestRateLimiter }
