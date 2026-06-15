import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

export const integratedAiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests, please try again later' },
  validate: { trustProxy: false },
  skip: (req) => {
    // Don't rate limit health checks or test endpoints
    if (req.path === '/health' || req.path === '/test') {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    logger.warn(`[RATE-LIMIT] Too many requests from ${req.ip}`);
    res.status(429).json({ error: 'Too many AI requests, please try again later' });
  },
});