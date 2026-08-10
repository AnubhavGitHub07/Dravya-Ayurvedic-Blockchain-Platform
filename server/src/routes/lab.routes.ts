import { Router } from 'express'
import {
  getLabDashboard,
  getAssignedTests,
  getTestDetails,
  receiveSample,
  startTest,
  addTestResult,
  completeTest,
  generateReport,
  finalizeReport
} from '../controllers/lab.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/rbac.middleware'

const router = Router()

router.use(authenticate)
const labOnly = authorize('LAB', 'ADMIN')

router.get('/dashboard', labOnly, getLabDashboard)
router.get('/tests', labOnly, getAssignedTests)
router.get('/tests/:id', labOnly, getTestDetails)

router.post('/tests/:id/receive', labOnly, receiveSample)
router.post('/tests/:id/start', labOnly, startTest)
router.post('/tests/:id/results', labOnly, addTestResult)
router.post('/tests/:id/complete', labOnly, completeTest)

router.post('/tests/:id/report', labOnly, generateReport)
router.post('/reports/:id/finalize', labOnly, finalizeReport)

export default router
