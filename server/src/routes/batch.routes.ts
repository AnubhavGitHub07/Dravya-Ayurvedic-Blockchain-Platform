import { Router } from 'express'
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  submitBatch,
  getBatchSupplyChain,
} from '../controllers/batch.controller'
import { requestLotInspection } from '../controllers/inspection.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/rbac.middleware'

const router = Router()

// All batch routes require authentication
router.use(authenticate)

// Only PRODUCER and ADMIN can create batches
router.post('/', authorize('PRODUCER', 'ADMIN'), createBatch)

// Getting batches (ownership is handled in the controller)
router.get('/', authorize('PRODUCER', 'ADMIN'), getAllBatches)
router.get('/:id', authorize('PRODUCER', 'ADMIN'), getBatchById)
router.get('/:id/supply-chain', authorize('PRODUCER', 'ADMIN', 'VERIFICATION_AUTHORITY', 'LAB', 'DISTRIBUTOR'), getBatchSupplyChain)

// Updating/Submitting (ownership is handled in the controller)
router.patch('/:id', authorize('PRODUCER', 'ADMIN'), updateBatch)
router.post('/:id/submit', authorize('PRODUCER'), submitBatch)
router.post('/:id/inspection/request', authorize('PRODUCER'), requestLotInspection)

export default router
