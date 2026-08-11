import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { AuthenticatedRequest } from '../middleware/auth.middleware'
import { recordInspectionSchema, rejectInspectionSchema } from '../lib/validators'
import { BlockchainService } from '../services/blockchain.service'
import { HashingService } from '../services/hashing.service'
import { Role } from '@prisma/client'
// ─── PRODUCER ROUTES ─────────────────────────────────────

export async function requestLotInspection(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id
    const batchId = req.params.id as string

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { producerProfile: true, inspections: { where: { status: { in: ['PENDING', 'UNDER_INSPECTION'] } } } }
    })

    if (!batch) {
      sendError(res, 'Batch not found.', 404)
      return
    }

    if (batch.producerProfile.userId !== userId) {
      sendError(res, 'Forbidden. You do not own this batch.', 403)
      return
    }

    if (batch.producerProfile.verificationStatus !== 'VERIFIED') {
      sendError(res, 'Producer profile must be VERIFIED to request lot inspection.', 403)
      return
    }

    // Must be in eligible status (e.g., PENDING_VERIFICATION after submission)
    if (batch.status !== 'PENDING_VERIFICATION') {
      sendError(res, 'Batch must be in PENDING_VERIFICATION status to request inspection.', 400)
      return
    }

    if (batch.inspections.length > 0) {
      sendError(res, 'An active inspection request already exists for this batch.', 400)
      return
    }

    const inspection = await prisma.batchInspection.create({
      data: {
        batchId,
        declaredQuantity: batch.quantity,
        status: 'PENDING'
      }
    })

    sendSuccess(res, 'Lot inspection requested successfully.', { inspection }, 201)
  } catch (error) {
    console.error('Request lot inspection error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

// ─── AUTHORITY ROUTES ────────────────────────────────────

export async function getAssignedInspections(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id

    const inspections = await prisma.batchInspection.findMany({
      where: { authorityId },
      orderBy: { createdAt: 'desc' },
      include: {
        batch: {
          include: {
            herb: { select: { commonName: true } },
            producerProfile: { select: { farmName: true } }
          }
        }
      }
    })

    sendSuccess(res, 'Assigned lot inspections retrieved successfully.', { inspections })
  } catch (error) {
    console.error('Get assigned inspections error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getInspectionDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id
    const id = req.params.id as string

    const inspection = await prisma.batchInspection.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            herb: true,
            producerProfile: { include: { user: { select: { name: true, phone: true } } } }
          }
        }
      }
    })

    if (!inspection) {
      sendError(res, 'Inspection record not found.', 404)
      return
    }

    if (inspection.authorityId !== authorityId) {
      sendError(res, 'Forbidden. You are not assigned to this inspection.', 403)
      return
    }

    sendSuccess(res, 'Inspection details retrieved successfully.', { inspection })
  } catch (error) {
    console.error('Get inspection details error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function startInspection(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id
    const id = req.params.id as string

    const inspection = await prisma.batchInspection.findUnique({ where: { id } })

    if (!inspection) {
      sendError(res, 'Inspection record not found.', 404)
      return
    }

    if (inspection.authorityId !== authorityId) {
      sendError(res, 'Forbidden. You are not assigned to this inspection.', 403)
      return
    }

    if (inspection.status !== 'PENDING') {
      sendError(res, 'Inspection has already been started or completed.', 400)
      return
    }

    const updatedInspection = await prisma.batchInspection.update({
      where: { id },
      data: { status: 'UNDER_INSPECTION' }
    })

    sendSuccess(res, 'Inspection started successfully.', { inspection: updatedInspection })
  } catch (error) {
    console.error('Start inspection error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function approveLotInspection(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id
    const id = req.params.id as string

    const validation = recordInspectionSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors)
      return
    }

    const inspection = await prisma.batchInspection.findUnique({ where: { id } })

    if (!inspection) {
      sendError(res, 'Inspection record not found.', 404)
      return
    }

    if (inspection.authorityId !== authorityId) {
      sendError(res, 'Forbidden. You are not assigned to this inspection.', 403)
      return
    }

    if (inspection.status === 'APPROVED' || inspection.status === 'REJECTED') {
      sendError(res, 'This inspection has already been finalized.', 400)
      return
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update inspection
      const updatedInspection = await tx.batchInspection.update({
        where: { id },
        data: {
          ...validation.data,
          status: 'APPROVED',
          decision: 'APPROVED',
        }
      })

      // 2. Update batch status
      await tx.batch.update({
        where: { id: inspection.batchId },
        data: { status: 'READY_FOR_LAB' }
      })

      return updatedInspection
    })

    // STEP 6: Automatic Blockchain Anchoring
    const payload = HashingService.getBatchInspectionPayload(result)
    BlockchainService.anchorRecord('BATCH_INSPECTION', result.id, 1, payload, req.user!.role as Role).catch(err => {
      console.error('Failed to trigger async blockchain anchor for BI:', err)
    })

    sendSuccess(res, 'Lot inspection approved.', { inspection: result })
  } catch (error) {
    console.error('Approve lot inspection error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function rejectLotInspection(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const authorityId = req.user!.id
    const id = req.params.id as string

    const validation = rejectInspectionSchema.safeParse(req.body)
    if (!validation.success) {
      sendError(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors)
      return
    }

    const inspection = await prisma.batchInspection.findUnique({ where: { id } })

    if (!inspection) {
      sendError(res, 'Inspection record not found.', 404)
      return
    }

    if (inspection.authorityId !== authorityId) {
      sendError(res, 'Forbidden. You are not assigned to this inspection.', 403)
      return
    }

    if (inspection.status === 'APPROVED' || inspection.status === 'REJECTED') {
      sendError(res, 'This inspection has already been finalized.', 400)
      return
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update inspection
      const updatedInspection = await tx.batchInspection.update({
        where: { id },
        data: {
          rejectionReason: validation.data.rejectionReason,
          status: 'REJECTED',
          decision: 'REJECTED',
        }
      })

      // 2. Update batch status
      await tx.batch.update({
        where: { id: inspection.batchId },
        data: { status: 'REJECTED' }
      })

      return updatedInspection
    })

    // STEP 6: Automatic Blockchain Anchoring
    const payload = HashingService.getBatchInspectionPayload(result)
    BlockchainService.anchorRecord('BATCH_INSPECTION', result.id, 1, payload, req.user!.role as Role).catch(err => {
      console.error('Failed to trigger async blockchain anchor for BI:', err)
    })

    sendSuccess(res, 'Lot inspection rejected.', { inspection: result })
  } catch (error) {
    console.error('Reject lot inspection error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
