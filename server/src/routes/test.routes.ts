import { Router, Response } from 'express'
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware'
import { authorize } from '../middleware/rbac.middleware'

const router = Router()

// ─── RBAC Test Routes ────────────────────────────────────
// Temporary development/testing routes to verify role authorization.
// These can be removed once RBAC is confirmed working.

router.get(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Admin access granted.',
      data: { user: req.user, accessLevel: 'ADMIN' },
    })
  }
)

router.get(
  '/producer',
  authenticate,
  authorize('PRODUCER', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Producer access granted.',
      data: { user: req.user, accessLevel: 'PRODUCER' },
    })
  }
)

router.get(
  '/lab',
  authenticate,
  authorize('LAB', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Lab access granted.',
      data: { user: req.user, accessLevel: 'LAB' },
    })
  }
)

router.get(
  '/distributor',
  authenticate,
  authorize('DISTRIBUTOR', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Distributor access granted.',
      data: { user: req.user, accessLevel: 'DISTRIBUTOR' },
    })
  }
)

router.get(
  '/verification',
  authenticate,
  authorize('VERIFICATION_AUTHORITY', 'ADMIN'),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Verification Authority access granted.',
      data: { user: req.user, accessLevel: 'VERIFICATION_AUTHORITY' },
    })
  }
)

export default router
