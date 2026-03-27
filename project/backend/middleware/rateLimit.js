import { rateLimit } from 'express-rate-limit';

// Global rate limiter for standard API requests
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later."
});

// Specific limiter for high-value actions (interest notifications)
export const interestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 interest notifications per hour
  message: "You have reached the limit of interest notifications for this hour. Please wait before trying again.",
  standardHeaders: true,
  legacyHeaders: false
});
