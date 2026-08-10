import { Router } from 'express'
import { assignVerificationAuthority, assignLotInspection, assignLabTest } from '../controllers/admin.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/rbac.middleware'

const router = Router()

// Admin routes
router.use(authenticate)
router.use(authorize('ADMIN'))

router.post('/verifications/:id/assign', assignVerificationAuthority)
router.post('/inspections/:id/assign', assignLotInspection)
router.post('/assign-lab-test', assignLabTest)

export default router
