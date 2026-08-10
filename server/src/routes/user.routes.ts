import { Router } from 'express'
import { getAllUsers, getUserById, toggleUserStatus } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// All user routes require authentication
router.use(authenticate)

router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.patch('/:id/toggle-status', toggleUserStatus)

export default router
