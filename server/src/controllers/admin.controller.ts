import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { AuthenticatedRequest } from '../middleware/auth.middleware'

export async function assignVerificationAuthority(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const adminId = req.user!.id
    const id = req.params.id as string
    const { authorityId } = req.body

    if (!authorityId) {
      sendError(res, 'authorityId is required.', 400)
      return
    }

    const verification = await prisma.producerVerification.findUnique({ where: { id } })
    if (!verification) {
      sendError(res, 'Verification record not found.', 404)
      return
    }

    // Check if the authorityId belongs to a VERIFICATION_AUTHORITY user
    const authority = await prisma.user.findUnique({ where: { id: authorityId } })
    if (!authority || authority.role !== 'VERIFICATION_AUTHORITY') {
      sendError(res, 'Invalid authorityId. User is not a VERIFICATION_AUTHORITY.', 400)
      return
    }

    const updatedVerification = await prisma.producerVerification.update({
      where: { id },
      data: {
        authorityId,
        assignedBy: adminId,
        assignedAt: new Date(),
        status: verification.status === 'PENDING' ? 'ASSIGNED' : verification.status
      }
    })

    sendSuccess(res, 'Authority assigned to verification successfully.', { verification: updatedVerification })
  } catch (error) {
    console.error('Assign verification authority error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function assignLotInspection(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const adminId = req.user!.id
    const id = req.params.id as string
    const { authorityId } = req.body

    if (!authorityId) {
      sendError(res, 'authorityId is required.', 400)
      return
    }

    const inspection = await prisma.batchInspection.findUnique({ where: { id } })
    if (!inspection) {
      sendError(res, 'Inspection record not found.', 404)
      return
    }

    // Check if the authorityId belongs to a VERIFICATION_AUTHORITY user
    const authority = await prisma.user.findUnique({ where: { id: authorityId } })
    if (!authority || authority.role !== 'VERIFICATION_AUTHORITY') {
      sendError(res, 'Invalid authorityId. User is not a VERIFICATION_AUTHORITY.', 400)
      return
    }

    const updatedInspection = await prisma.batchInspection.update({
      where: { id },
      data: {
        authorityId,
        assignedBy: adminId,
        assignedAt: new Date()
      }
    })

    sendSuccess(res, 'Authority assigned to lot inspection successfully.', { inspection: updatedInspection })
  } catch (error) {
    console.error('Assign lot inspection error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function assignLabTest(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const adminId = req.user!.id
    const { batchId, labId } = req.body

    if (!batchId || !labId) {
      sendError(res, 'batchId and labId are required.', 400)
      return
    }

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { qualityTests: { where: { status: { notIn: ['COMPLETED'] } } } }
    })

    if (!batch) {
      sendError(res, 'Batch not found.', 404)
      return
    }

    if (batch.status !== 'READY_FOR_LAB') {
      sendError(res, 'Batch must be READY_FOR_LAB to be assigned for testing.', 400)
      return
    }

    if (batch.qualityTests.length > 0) {
      sendError(res, 'Batch already has an active lab test assignment.', 400)
      return
    }

    const lab = await prisma.user.findUnique({ where: { id: labId } })
    if (!lab || lab.role !== 'LAB') {
      sendError(res, 'Invalid labId. User is not a LAB.', 400)
      return
    }
    
    if (!lab.isActive) {
      sendError(res, 'Lab account is inactive.', 400)
      return
    }

    const qualityTest = await prisma.qualityTest.create({
      data: {
        batchId,
        labId,
        assignedBy: adminId,
        assignedAt: new Date(),
        status: 'ASSIGNED'
      }
    })

    sendSuccess(res, 'Batch assigned to LAB successfully.', { qualityTest }, 201)
  } catch (error) {
    console.error('Assign lab error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
