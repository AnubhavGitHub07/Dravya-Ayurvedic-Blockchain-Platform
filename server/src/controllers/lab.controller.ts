import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { addTestResultSchema, generateLabReportSchema } from '../lib/validators'
import { BlockchainService } from '../services/blockchain.service'
import { HashingService } from '../services/hashing.service'
import { NotificationService } from '../services/notification.service'
import { AuditService } from '../services/audit.service'
import { Role } from '@prisma/client'
// ─── DASHBOARD & READ ────────────────────────────────────

export async function getLabDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id

    const assignedTests = await prisma.qualityTest.count({ where: { labId, status: 'ASSIGNED' } })
    const samplesReceived = await prisma.qualityTest.count({ where: { labId, status: 'SAMPLE_RECEIVED' } })
    const underTesting = await prisma.qualityTest.count({ where: { labId, status: 'UNDER_TESTING' } })
    const completedTests = await prisma.qualityTest.count({ where: { labId, status: 'COMPLETED' } })
    const passedTests = await prisma.qualityTest.count({ where: { labId, overallResult: 'PASS' } })
    const failedTests = await prisma.qualityTest.count({ where: { labId, overallResult: 'FAIL' } })

    const recentAssigned = await prisma.qualityTest.findMany({
      where: { labId, status: 'ASSIGNED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { batch: { select: { batchNumber: true, herb: { select: { commonName: true } } } } }
    })

    sendSuccess(res, 'Lab dashboard data retrieved.', {
      dashboard: {
        assignedTests,
        samplesReceived,
        underTesting,
        completedTests,
        passedTests,
        failedTests
      },
      recentAssigned
    })
  } catch (error) {
    console.error('Get lab dashboard error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getAssignedTests(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id
    const tests = await prisma.qualityTest.findMany({
      where: { labId },
      orderBy: { createdAt: 'desc' },
      include: {
        batch: {
          select: { batchNumber: true, status: true, quantity: true, herb: { select: { commonName: true } } }
        }
      }
    })
    sendSuccess(res, 'Assigned tests retrieved.', { tests })
  } catch (error) {
    console.error('Get assigned tests error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getTestDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id
    const id = req.params.id as string

    const test = await prisma.qualityTest.findUnique({
      where: { id },
      include: {
        batch: {
          include: { herb: true, producerProfile: { select: { farmName: true } } }
        },
        results: true,
        reports: true
      }
    })

    if (!test) {
      sendError(res, 'Quality test not found.', 404)
      return
    }

    if (test.labId !== labId) {
      sendError(res, 'Forbidden. This test is not assigned to you.', 403)
      return
    }

    sendSuccess(res, 'Test details retrieved.', { test })
  } catch (error) {
    console.error('Get test details error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

// ─── TEST EXECUTION ──────────────────────────────────────

export async function receiveSample(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id
    const id = req.params.id as string

    const test = await prisma.qualityTest.findUnique({ 
      where: { id },
      include: { batch: { include: { producerProfile: { select: { userId: true } } } } }
    })

    if (!test) return sendError(res, 'Quality test not found.', 404)
    if (test.labId !== labId) return sendError(res, 'Forbidden. Not assigned to you.', 403)
    if (test.status !== 'ASSIGNED') return sendError(res, 'Test is not in ASSIGNED status.', 400)

    // Generate unique sample ID
    const year = new Date().getFullYear()
    const count = await prisma.qualityTest.count({ where: { sampleId: { not: null } } })
    const sampleIdStr = `SMP-${year}-${String(count + 1).padStart(5, '0')}`

    const updated = await prisma.qualityTest.update({
      where: { id },
      data: {
        status: 'SAMPLE_RECEIVED',
        receivedAt: new Date(),
        sampleId: sampleIdStr
      }
    })

    NotificationService.createNotification({
      userId: test.batch.producerProfile.userId,
      type: 'LAB_SAMPLE_RECEIVED',
      title: 'Lab Sample Received',
      message: `Sample for batch ${test.batch.batchNumber} has been received by the lab.`,
      entityType: 'QUALITY_TEST',
      entityId: id,
      eventKey: `LAB_SAMPLE_RECEIVED:${id}`,
      priority: 'NORMAL'
    })

    await AuditService.recordStateChange({
      action: 'LAB_SAMPLE_RECEIVED',
      actorId: labId,
      entityType: 'QualityTest',
      entityId: id,
      newState: { status: updated.status, sampleId: updated.sampleId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    sendSuccess(res, 'Sample received.', { test: updated })
  } catch (error) {
    console.error('Receive sample error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function startTest(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id
    const id = req.params.id as string

    const test = await prisma.qualityTest.findUnique({ 
      where: { id },
      include: { batch: { include: { producerProfile: { select: { userId: true } } } } }
    })

    if (!test) return sendError(res, 'Quality test not found.', 404)
    if (test.labId !== labId) return sendError(res, 'Forbidden. Not assigned to you.', 403)
    if (test.status !== 'SAMPLE_RECEIVED') return sendError(res, 'Test must be SAMPLE_RECEIVED to start.', 400)

    const updated = await prisma.qualityTest.update({
      where: { id },
      data: {
        status: 'UNDER_TESTING',
        testingStartedAt: new Date(),
      }
    })

    NotificationService.createNotification({
      userId: test.batch.producerProfile.userId,
      type: 'LAB_TEST_STARTED',
      title: 'Lab Test Started',
      message: `Quality testing for batch ${test.batch.batchNumber} has started.`,
      entityType: 'QUALITY_TEST',
      entityId: id,
      eventKey: `LAB_TEST_STARTED:${id}`,
      priority: 'NORMAL'
    })

    await AuditService.recordStateChange({
      action: 'LAB_TEST_STARTED',
      actorId: labId,
      entityType: 'QualityTest',
      entityId: id,
      newState: { status: updated.status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    sendSuccess(res, 'Testing started.', { test: updated })
  } catch (error) {
    console.error('Start test error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function addTestResult(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id
    const id = req.params.id as string

    const validation = addTestResultSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors)
      return
    }

    const test = await prisma.qualityTest.findUnique({ where: { id } })

    if (!test) return sendError(res, 'Quality test not found.', 404)
    if (test.labId !== labId) return sendError(res, 'Forbidden. Not assigned to you.', 403)
    if (test.status !== 'UNDER_TESTING') return sendError(res, 'Test must be UNDER_TESTING to add results.', 400)

    const testResult = await prisma.testResult.create({
      data: {
        qualityTestId: id,
        ...validation.data
      }
    })

    await AuditService.recordStateChange({
      action: 'LAB_RESULT_ADDED',
      actorId: labId,
      entityType: 'TestResult',
      entityId: testResult.id,
      newState: { parameter: testResult.parameter, resultStatus: testResult.resultStatus },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    sendSuccess(res, 'Test result added.', { testResult }, 201)
  } catch (error) {
    console.error('Add test result error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function completeTest(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id
    const id = req.params.id as string

    const test = await prisma.qualityTest.findUnique({
      where: { id },
      include: { 
        results: true,
        batch: { include: { producerProfile: { select: { userId: true } } } }
      }
    })

    if (!test) return sendError(res, 'Quality test not found.', 404)
    if (test.labId !== labId) return sendError(res, 'Forbidden. Not assigned to you.', 403)
    if (test.status !== 'UNDER_TESTING') return sendError(res, 'Test must be UNDER_TESTING to complete.', 400)
    
    if (test.results.length === 0) {
      return sendError(res, 'Cannot complete test without any results.', 400)
    }

    // Determine overall result
    const hasFail = test.results.some(r => r.resultStatus === 'FAIL')
    const overallResult = hasFail ? 'FAIL' : 'PASS'
    const newBatchStatus = overallResult === 'PASS' ? 'QUALITY_APPROVED' : 'QUALITY_REJECTED'

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update test
      const t = await tx.qualityTest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          testingCompletedAt: new Date(),
          overallResult
        }
      })
      // 2. Update batch status
      await tx.batch.update({
        where: { id: test.batchId },
        data: { status: newBatchStatus }
      })

      return t
    })

    // STEP 6: Automatic Blockchain Anchoring
    const payload = HashingService.getQualityTestPayload(updated)
    BlockchainService.anchorRecord('QUALITY_TEST', updated.id, 1, payload, req.user!.role as Role).catch(err => {
      console.error('Failed to trigger async blockchain anchor for QT:', err)
    })

    NotificationService.createNotification({
      userId: test.batch.producerProfile.userId,
      type: 'LAB_TEST_COMPLETED',
      title: 'Lab Test Completed',
      message: `Quality testing for batch ${test.batch.batchNumber} is complete.`,
      entityType: 'QUALITY_TEST',
      entityId: id,
      eventKey: `LAB_TEST_COMPLETED:${id}`,
      priority: 'NORMAL'
    })

    const passType = overallResult === 'PASS' ? 'LAB_TEST_PASSED' : 'LAB_TEST_FAILED'
    const priority = overallResult === 'PASS' ? 'NORMAL' : 'HIGH'

    NotificationService.createNotification({
      userId: test.batch.producerProfile.userId,
      type: passType,
      title: overallResult === 'PASS' ? 'Lab Test Passed' : 'Lab Test Failed',
      message: `Quality testing for batch ${test.batch.batchNumber} has ${overallResult === 'PASS' ? 'passed' : 'failed'}.`,
      entityType: 'QUALITY_TEST',
      entityId: id,
      eventKey: `${passType}:${id}`,
      priority
    })

    await AuditService.recordStateChange({
      action: 'LAB_TEST_COMPLETED',
      actorId: labId,
      entityType: 'QualityTest',
      entityId: id,
      newState: { status: updated.status, overallResult },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    sendSuccess(res, 'Test completed successfully.', { test: updated })
  } catch (error) {
    console.error('Complete test error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

// ─── REPORTS ─────────────────────────────────────────────

export async function generateReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id
    const id = req.params.id as string

    const validation = generateLabReportSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors)
      return
    }

    const test = await prisma.qualityTest.findUnique({ where: { id }, include: { reports: true } })

    if (!test) return sendError(res, 'Quality test not found.', 404)
    if (test.labId !== labId) return sendError(res, 'Forbidden. Not assigned to you.', 403)
    if (test.status !== 'COMPLETED') return sendError(res, 'Test must be COMPLETED to generate report.', 400)

    if (test.reports.some(r => r.status === 'FINALIZED')) {
      return sendError(res, 'A finalized report already exists. Re-testing is required for new reports.', 400)
    }

    const year = new Date().getFullYear()
    const count = await prisma.labReport.count()
    const reportNumber = `LAB-REP-${year}-${String(count + 1).padStart(5, '0')}`

    const report = await prisma.labReport.create({
      data: {
        qualityTestId: id,
        generatedBy: labId,
        reportNumber,
        reportUrl: validation.data.reportUrl,
        reportFileName: validation.data.reportFileName,
        reportFileType: validation.data.reportFileType,
        status: 'DRAFT'
      }
    })

    sendSuccess(res, 'Lab report draft generated.', { report }, 201)
  } catch (error) {
    console.error('Generate report error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function finalizeReport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const labId = req.user!.id
    const reportId = req.params.id as string

    const report = await prisma.labReport.findUnique({
      where: { id: reportId },
      include: { qualityTest: true }
    })

    if (!report) return sendError(res, 'Report not found.', 404)
    if (report.qualityTest.labId !== labId) return sendError(res, 'Forbidden.', 403)
    if (report.status === 'FINALIZED') return sendError(res, 'Report is already finalized.', 400)

    const updated = await prisma.labReport.update({
      where: { id: reportId },
      data: { status: 'FINALIZED', finalizedAt: new Date() }
    })

    // STEP 6: Automatic Blockchain Anchoring
    const payload = HashingService.getLabReportPayload(updated)
    BlockchainService.anchorRecord('LAB_REPORT', updated.id, 1, payload, req.user!.role as Role).catch(err => {
      console.error('Failed to trigger async blockchain anchor for LR:', err)
    })

    await AuditService.recordStateChange({
      action: 'LAB_REPORT_FINALIZED',
      actorId: labId,
      entityType: 'LabReport',
      entityId: updated.id,
      newState: { status: updated.status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    })

    sendSuccess(res, 'Report finalized successfully.', { report: updated })
  } catch (error) {
    console.error('Finalize report error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
