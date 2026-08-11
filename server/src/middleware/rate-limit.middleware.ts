import rateLimit from 'express-rate-limit'

// Global API rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Specific stricter limiter for Auth routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 login/register requests per hour
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Specific limiter for Public QR routes to prevent scraping
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 QR scan requests per 15 minutes
  message: {
    success: false,
    message: 'Too many QR code scans from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
