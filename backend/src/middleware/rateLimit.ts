import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

export const sosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // prevent abuse of the SOS endpoint
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many SOS activations. Please try again later.' },
});
