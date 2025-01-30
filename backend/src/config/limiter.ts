import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 5, // 5 peticiones
  message: { error: 'Has alcanzado el límite de peticiones' }
})
