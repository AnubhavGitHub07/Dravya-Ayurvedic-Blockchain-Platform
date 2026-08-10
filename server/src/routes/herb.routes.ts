import { Router } from 'express'
import {
  createHerb,
  updateHerb,
  getAllHerbs,
  getHerbById,
} from '../controllers/herb.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/rbac.middleware'

const router = Router()

// All herb routes require authentication
router.use(authenticate)

// Public catalog access (read-only for all authenticated users)
router.get('/', getAllHerbs)
router.get('/:id', getHerbById)

// Admin only (write access)
const adminOnly = authorize('ADMIN')
router.post('/', adminOnly, createHerb)
router.patch('/:id', adminOnly, updateHerb)

export default router
