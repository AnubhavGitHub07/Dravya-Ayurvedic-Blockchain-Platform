import { Router } from 'express'
import { assignVerificationAuthority, assignLotInspection, assignLabTest, assignDistributor } from '../controllers/admin.controller'
import { getAuditLogs, getAuditLogById } from '../controllers/audit.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/rbac.middleware'

const router = Router()

// Admin routes
router.use(authenticate)
router.use(authorize('ADMIN'))

router.post('/verifications/:id/assign', assignVerificationAuthority)
router.post('/inspections/:id/assign', assignLotInspection)
router.post('/assign-lab-test', assignLabTest)

// Step 7: QR Code Management
import { generateBatchQR, getBatchQR, revokeBatchQR } from '../controllers/admin.controller'
router.post('/batches/:id/qr', generateBatchQR)
router.get('/batches/:id/qr', getBatchQR)
router.post('/qr/:id/revoke', revokeBatchQR)

// Step 8: Distributor Assignment
router.post('/batches/:id/assign-distributor', assignDistributor)

// Step 9: Audit Logs
router.get('/audit', getAuditLogs)
router.get('/audit/:id', getAuditLogById)

export default router
