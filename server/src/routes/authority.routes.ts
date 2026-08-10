import { Router } from 'express'
import {
  getAssignedVerifications,
  getVerificationDetails,
  approveVerification,
  rejectVerification,
} from '../controllers/verification.controller'
import {
  getAssignedInspections,
  getInspectionDetails,
  startInspection,
  approveLotInspection,
  rejectLotInspection,
} from '../controllers/inspection.controller'
import { getAuthorityDashboard } from '../controllers/authority.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/rbac.middleware'

const router = Router()

// All authority routes require authentication
router.use(authenticate)

// Only VERIFICATION_AUTHORITY (and ADMIN for oversight/testing)
const authorityOnly = authorize('VERIFICATION_AUTHORITY', 'ADMIN')

// Dashboard
router.get('/dashboard', authorityOnly, getAuthorityDashboard)

// Producer Verifications
router.get('/producer-verifications', authorityOnly, getAssignedVerifications)
router.get('/producer-verifications/:id', authorityOnly, getVerificationDetails)
router.post('/producer-verifications/:id/approve', authorityOnly, approveVerification)
router.post('/producer-verifications/:id/reject', authorityOnly, rejectVerification)

// Lot Inspections
router.get('/lot-inspections', authorityOnly, getAssignedInspections)
router.get('/lot-inspections/:id', authorityOnly, getInspectionDetails)
router.post('/lot-inspections/:id/start', authorityOnly, startInspection)
router.post('/lot-inspections/:id/approve', authorityOnly, approveLotInspection)
router.post('/lot-inspections/:id/reject', authorityOnly, rejectLotInspection)

export default router
