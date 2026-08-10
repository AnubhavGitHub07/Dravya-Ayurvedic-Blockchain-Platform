import { Router } from 'express'
import { requestVerification, getVerificationHistory } from '../controllers/verification.controller'
import {
  getMyProfile,
  updateMyProfile,
  getMyVerificationStatus,
  getMyDashboard,
  getBatchQualityStatus,
} from '../controllers/producer.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/rbac.middleware'

const router = Router()

// All producer routes require authentication
router.use(authenticate)

// Only PRODUCER and ADMIN can access producer endpoints
// Usually ADMIN accesses these via a different set of endpoints (like /admin/producers),
// but we allow ADMIN here for testing/flexibility if needed.
const producerAccess = authorize('PRODUCER', 'ADMIN')

router.get('/me', producerAccess, getMyProfile)
router.patch('/me', producerAccess, updateMyProfile)
router.get('/me/verification', producerAccess, getMyVerificationStatus)
router.get('/me/dashboard', producerAccess, getMyDashboard)

// Verification Workflow
router.post('/me/verification/request', producerAccess, requestVerification)
router.get('/me/verification/history', producerAccess, getVerificationHistory)

// Quality Status
router.get('/batches/:id/quality', producerAccess, getBatchQualityStatus)

export default router
