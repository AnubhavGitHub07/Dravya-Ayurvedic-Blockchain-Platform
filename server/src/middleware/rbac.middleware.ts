import { Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { AuthenticatedRequest } from './auth.middleware'

// ─── Role-Based Access Control Middleware ────────────────

/**
 * Factory that returns middleware restricting access to the
 * specified roles.  Must be used AFTER `authenticate`.
 *
 * Usage:
 *   router.get('/admin', authenticate, authorize('ADMIN'), handler)
 *   router.get('/producer', authenticate, authorize('PRODUCER', 'ADMIN'), handler)
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user

    if (!user) {
      // This means authenticate() was not called before authorize()
      res.status(401).json({ success: false, message: 'Authentication required.' })
      return
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.',
      })
      return
    }

    next()
  }
}
